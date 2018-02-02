module Main where

import Alchemy.Entity.Storage
import Alchemy.FRP.Channel
import Alchemy.FRP.Stream
import Data.Tuple
import Prelude

import Alchemy.DOM.Inferno as I
import Alchemy.DOM.KeyboardEvent (KeyEvent, KeyboardST, keyboard, keydown, keyup, keyboard, pressed)
import Alchemy.Pixi (PIXI)
import Alchemy.Pixi.Application as App
import Alchemy.Pixi.Graphics as G
import Control.Monad.Eff (Eff, kind Effect, foreachE)
import Control.Monad.Eff.Console (CONSOLE, log)
import Control.Monad.ST (ST, STRef, newSTRef, readSTRef, writeSTRef)
import DOM (DOM)
import Data.Array (snoc)
import Data.DateTime (time)
import Data.Foreign.Keys (keys)
import Data.Symbol (SProxy(..))
import Math (sin, cos, min, max)
import Signal.DOM (animationFrame)
import Type.Row (RProxy(..))

type V2 =
  { x :: Number, y :: Number }

data GameMode =
  Init | Running | P1Win | P2Win

type GameObj =
  { pixiRef :: G.Ref
  , x :: Number
  , y :: Number
  , dx :: Number
  , dy :: Number
  , w :: Number
  , h :: Number
  }

type GameState =
  { mode :: GameMode
  , scoreP1 :: Int
  , scoreP2 :: Int
  }

type Game =
  { state :: GameState
  , ball :: GameObj
  , p1 :: GameObj
  , p2 :: GameObj
  , ui :: I.VDom ()
  , time :: Number
  }

type GameInput =
  { p1 :: Number
  , p2 :: Number
  , deltaT :: Number
  }

data Player = P1 | P2

data Direction = Up | Down

data InputMsg =
  HitBank
  | HitPaddle
  | Score Player
  | NoOp

foreign import logAny ::
  ∀ a eff. a → Eff ( console :: CONSOLE | eff ) Unit

fieldWidth = 600.0 :: Number
fieldHeight = 400.0 :: Number
paddleWidth = 20.0 :: Number
paddleHeight = 50.0 :: Number
ballSize = 5.0 :: Number

-- ========================================
-- INIT

initGameState :: GameState
initGameState =
  { mode: Init
  , scoreP1: 0
  , scoreP2: 0
  }

initBall :: Number → G.Ref → GameObj
initBall a ref =
  { pixiRef: ref
  , x: (fieldWidth - ballSize) / 2.0
  , y: (fieldHeight - ballSize) / 2.0
  , dx: 5.0 * cos(a)
  , dy: 5.0 * sin(a)
  , w: ballSize
  , h: ballSize
  }

initGame :: ∀ eff h
  . App.Stage
  → Eff (pixi :: PIXI, st :: ST h | eff) (STRef h Game)
initGame s = do
  gP1 <- G.rect s (G.Color 0xFFFFFF) paddleWidth paddleHeight
  gP2 <- G.rect s (G.Color 0xFFFFFF) paddleWidth paddleHeight
  gBall <- G.circle s (G.Color 0xFFFFFF) ballSize

  newSTRef { state: initGameState
           , ball: initBall 1.0 gBall
           , p1:
             { pixiRef: gP1
             , x: 1.0
             , y: (fieldHeight - paddleHeight) / 2.0
             , dx: 0.0
             , y: 0.0
             , w: paddleWidth
             , h: paddleHeight
             }
           , p2:
             { pixiRef: gP2
             , x: fieldWidth - paddleWidth - 1.0
             , y: (fieldHeight - paddleHeight) / 2.0
             , dx: 0.0
             , dy: 0.0
             , w: paddleWidth
             , h: paddleHeight
             }
           , ui:
             { vnode: renderVDom initGameState
             , root: "#ui"
             }
           }


-- ========================================
-- UPDATE

startNewGame :: Game → Game
startNewGame g =
  let s = { mode: Running
          , scoreP1: 0
          , scoreP2: 0
          }
  in
    g { state = s
      , ball = initBall g.time g.ball.pixiRef
      , ui { vnode = renderVDom s }
      }

makeInp :: KeyboardST → Number → GameInput
makeInp k dt =
  let p1 = if pressed "KeyQ" k then 1.0
           else if pressed "KeyA" k then -1.0
           else 0.0

      p2 = if pressed "ArrowUp" k then 1.0
           else if pressed "ArrowDown" k then -1.0
           else 0.0

   in { p1: p1
      , p2: p2
      , deltaT: dt
      }

update :: GameInput → Game → Game
update gIn g =
  if g.state.mode == Running then
    stepGame gIn g
  else
    if pressed "Space" gIn.keys then
      startNewGame g
    else
      g

stepGame :: GameInput → Game → Game
stepGame i g =
  let p1 = stepPlayer { dir: i.p1, dt: i.deltaT, p: g.p1 }
      p2 = stepPlayer { dir: i.p2, dt: i.deltaT, p: g.p2 }
      { ball, s1, s2 } =
        stepBall { dt: i.deltaT
                 , ball: g.ball
                 , p1: p1
                 , p2: p2
                 }
      state = stepMeta s1 s2 g.state
      scored = state.scoreP1 /= g.state.scoreP1 || state.scoreP2 /= g.state.scoreP2
   in { state: state
      , ball: if scored
                then initBall g.time g.ball.pixiRef
                else ball
      , p1: p1
      , p2: p2
      , ui: { vdom: if state /= g.state then renderVDom state else g.ui.vdom
            , root: state.ui.root
            }
      }

stepBall ::
    { dt :: Number, ball :: GameObj, p1 :: GameObj, p2 :: GameObj }
  → { ball :: GameObj, s1 :: Int, s2 :: Int }
stepBall i =
  stepPos i.dt i.ball # collitionHandling
  where collitionHandling b
          | intersect b i.p1 =
            { ball: b { dx = -b.dx, dy = b.dy }
            , s1: 0
            , s2: 0
            }
          | intersect b i.p2 =
            { ball: b { dx = -b.dx, dy = b.dy }
            , s1: 0
            , s2: 0
            }
          | otherwise =
            { ball: b, s1: 0, s2: 0 }


stepPos :: Number → GameObj → GameObj
stepPos dt o =
  let x = o.x + dt * o.dx
      y = o.y + dt * o.dy
   in o { x = o.x + dt * o.dx
        , y = max 0.0 (min (fieldHeight - o.h) y)
        }

intersect :: GameObj → GameObj → Boolean
intersect m o
  | m.x + m.w < o.x = false
  | m.x > o.x + o.w = false
  | m.y + m.h < o.y = false
  | m.y > o.y + o.h = false
  | otherwise = true


stepPlayer :: { dir :: Number, dt :: Number, p :: GameObj } → GameObj
stepPlayer i = i.p

stepMeta :: Int → Int → GameState → GameState
stepMeta s1 s2 s =
  let s1' = s.scoreP1 + s1
      s2' = s.scoreP2 + s2
      m = if s1' == 10 then P1Win else if s2' == 10 then P2Win else s.mode
   in { mode: m
      , scoreP1: s1'
      , scoreP2: s2'
      }


-- ========================================
-- VIEW

renderVDom :: GameState → I.VNode
renderVDom st =
  I.div []
    [ I.div [ I.id "score" ]
      [ I.text ((show st.scoreP1) <> " : " <> (show st.scoreP2)) ]
    , renderInfo st.mode
    ]
    where renderInfo :: GameMode → I.VNode
          renderInfo Init =
            renderInfoMsg "Welcome to PS-Pong!" "Press [Space] to start"
          renderInfo Running =
            I.div [] []
          renderInfo P1Win =
            renderInfoMsg "Player 1 wins!" "Press [Space] to restart"
          renderInfo P2Win =
            renderInfoMsg "Player 2 wins!" "Press [Space] to restart"

          renderInfoMsg :: String → String → I.VNode
          renderInfoMsg title subtitle =
            I.div [ I.id "info-msg" ]
              [ I.div [ I.className "title" ] [ I.text title]
              , I.div [ I.className "title" ] [ I.text subtitle]
              ]

updatePos :: ∀ eff. Game → Eff (pixi :: PIXI | eff) Unit
updatePos g =
  G.setPos $ [g.ball, g.p1, g.p2]

-- ========================================
-- MAIN

main :: ∀ eff h.
  Eff ( frp :: FRP
      , frp :: FRP
      , st :: ST h
      , console :: CONSOLE
      , pixi :: PIXI
      , dom :: DOM
      | eff ) Unit
main = do
  let options = App.defaults { width = 600, height = 400 }

  app <- App.init options "#field"
  animationFrame <- App.tick app
  gameStateRef <- initGame (App.stage app)

  runGame (makeInp <$> fromEff keyboard # sampleBy animationFrame) gameStateRef

runGame :: ∀ eff h
  . Channel GameInput
  → Number
  → STRef h Game
  → Eff ( frp :: FRP
        , frp :: FRP
        , st :: ST h
        , console :: CONSOLE
        , pixi :: PIXI
        , dom :: DOM
        | eff ) Unit
runGame gameIn tact gameStateRef = do
  let gameS = fromEff $ readSTRef gameStateRef

      write :: ∀ a e. (a → Game) → (a → Eff (st :: ST h | e) Game)
      write fn = fn >>> writeSTRef gameStateRef

  gameS <#> update <#> write # sampleBy gameIn
  gameS <#> _.ui <#> I.render # sample tact
  gameS <#> updatePos # sample tact
