module Main where


import Prelude

import Alchemy.DOM.Inferno as I
import Alchemy.DOM.KeyboardEvent (KeyboardST, keyboard, pressed)
import Alchemy.FRP.Channel (Channel, FRP)
import Alchemy.FRP.Stream (Stream, fromEff, fromChannel, combine, sample)
import Alchemy.Pixi (PIXI)
import Alchemy.Pixi.Application as App
import Alchemy.Pixi.Graphics as G
import Control.Monad.Eff (Eff, kind Effect)
import Control.Monad.Eff.Console (CONSOLE)
import Control.Monad.ST (ST, STRef, newSTRef, readSTRef, writeSTRef)
import DOM (DOM)
import Math (sin, cos, min, max) as Math

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
  , space :: Boolean
  }

fieldWidth = 600.0 :: Number
fieldHeight = 400.0 :: Number
paddleWidth = 20.0 :: Number
paddleHeight = 60.0 :: Number
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
  , dx: 6.0 * Math.cos(a)
  , dy: 6.0 * Math.sin(a)
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
           , time: 0.0
           , ball: initBall 1.0 gBall
           , p1:
             { pixiRef: gP1
             , x: 1.0
             , y: (fieldHeight - paddleHeight) / 2.0
             , dx: 0.0
             , dy: 0.0
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
  let p1 = if pressed "KeyQ" k then -1.0
           else if pressed "KeyA" k then 1.0
           else 0.0

      p2 = if pressed "ArrowUp" k then -1.0
           else if pressed "ArrowDown" k then 1.0
           else 0.0

   in { p1: p1
      , p2: p2
      , deltaT: dt
      , space: pressed "Space" k
      }

update :: Game → GameInput → Game
update g gIn =
  let g' = g { time = g.time + gIn.deltaT }
   in
  case g.state.mode of
    Running -> stepGame gIn g'
    otherwise -> if gIn.space then
                   startNewGame g'
                 else
                   g'

stepGame :: GameInput → Game → Game
stepGame i g =
  let p1 = stepPlayer { dir: i.p1, dt: i.deltaT, p: g.p1 }
      p2 = stepPlayer { dir: i.p2, dt: i.deltaT, p: g.p2 }
      ball = stepBall { dt: i.deltaT, ball: g.ball, p1: p1, p2: p2 }
      { s1, s2 } = score ball
      state = stepMeta s1 s2 g.state
      scored = s1 || s2
   in { state: state
      , time: g.time
      , ball: if scored
                then initBall g.time g.ball.pixiRef
                else ball
      , p1: p1
      , p2: p2
      , ui: { vnode: renderVDom state
            , root: g.ui.root
            }
      }

stepBall ::
    { dt :: Number, ball :: GameObj, p1 :: GameObj, p2 :: GameObj }
  → GameObj
stepBall i =
  stepPos i.dt i.ball # collitionHandling
  where collitionHandling b
          | intersect b i.p1 =
              b { dx = -b.dx, dy = b.dy }
          | intersect b i.p2 =
              b { dx = -b.dx, dy = b.dy }
          | b.y <= 0.0 =
              b { dy = -b.dy, y = 0.0 }
          | b.y + b.h >= fieldHeight =
              b { dy = -b.dy, y = fieldHeight - b.h }
          | otherwise = b

score :: GameObj → { s1 :: Boolean, s2 :: Boolean }
score ball
  | ball.x <= 0.0 = { s1: false, s2: true }
  | ball.x + ball.w >= fieldWidth = { s1: true, s2: false }
  | otherwise = { s1: false, s2: false }

stepPos :: Number → GameObj → GameObj
stepPos dt o =
  let x = o.x + dt * o.dx
      y = o.y + dt * o.dy
   in o { x = o.x + dt * o.dx
        , y = Math.max 0.0 (Math.min (fieldHeight - o.h) y)
        }

intersect :: GameObj → GameObj → Boolean
intersect m o
  | m.x + m.w < o.x = false
  | m.x > o.x + o.w = false
  | m.y + m.h < o.y = false
  | m.y > o.y + o.h = false
  | otherwise = true

stepPlayer :: { dir :: Number, dt :: Number, p :: GameObj } → GameObj
stepPlayer i =
  let y = i.p.y + 5.0 * i.dir * i.dt
   in i.p { y = Math.max 0.0 (Math.min (fieldHeight - i.p.h) y) }

stepMeta :: Boolean → Boolean → GameState → GameState
stepMeta s1 s2 s =
  let s1' = if s1 then s.scoreP1 + 1 else s.scoreP1
      s2' = if s2 then s.scoreP2 + 1 else s.scoreP2
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

gameOptions :: App.Options
gameOptions = App.defaults { width = 600, height = 400 }

main :: ∀ eff h.
  Eff ( frp :: FRP
      , frp :: FRP
      , st :: ST h
      , console :: CONSOLE
      , pixi :: PIXI
      , dom :: DOM
      | eff ) Unit
main = do
  app <- App.init gameOptions "#field"
  animationFrame <- App.tick app
  gameStateRef <- initGame (App.stage app)
  runGame animationFrame gameStateRef

runGame :: ∀ eff h
  . Channel Number
  → STRef h Game
  → Eff ( frp :: FRP
        , frp :: FRP
        , st :: ST h
        , console :: CONSOLE
        , pixi :: PIXI
        , dom :: DOM
        | eff ) Unit
runGame tact gameStateRef = do
  let gameS :: Stream Game
      gameS = fromEff $ readSTRef gameStateRef

      inputS :: Stream GameInput
      inputS = combine makeInp (fromEff keyboard) (fromChannel tact 1.0)

  (combine update gameS inputS) <#> writeSTRef gameStateRef # sample tact
  gameS <#> _.ui <#> I.render # sample tact
  gameS <#> updatePos # sample tact
