module Main where


import Prelude

import Alchemy.DOM.Inferno as I
import Alchemy.DOM.KeyboardEvent (KeyboardST, keyboard, pressed)
import Alchemy.FRP.Channel (Channel, FRP)
import Alchemy.FRP.Stream (Stream, combine, fromEff, sample, sampleBy)
import Alchemy.Pixi (PIXI)
import Alchemy.Pixi.Application as App
import Alchemy.Pixi.Graphics as G
import Control.Monad.Eff (Eff, kind Effect)
import Control.Monad.Eff.Console (CONSOLE)
import Control.Monad.ST (ST, STRef, newSTRef, readSTRef, writeSTRef)
import DOM (DOM)
import Data.Array (snoc, replicate, uncons)
import Data.Int (round)
import Data.Maybe (Maybe(..))
import Data.Traversable (foldl, for)
import Math (sin, cos, min, max) as Math

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

type Game =
  { mode :: GameMode
  , activeBalls :: Array GameObj
  , pooledBalls :: Array G.Ref
  , p1 :: GameObj
  , p2 :: GameObj
  , score :: { p1 :: Int
             , p2 :: Int
             }
  , time :: Number
  , untilNextBall :: Number
  }

type UserInput =
  { p1 :: Number
  , p2 :: Number
  , space :: Boolean
  }

fieldWidth = 600.0 :: Number
fieldHeight = 400.0 :: Number
paddleWidth = 20.0 :: Number
paddleHeight = 60.0 :: Number
ballSize = 5.0 :: Number

-- ========================================
-- INIT

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

initBallGraphics :: ∀ eff.
  App.Stage → Eff (pixi :: PIXI | eff) (Array G.Ref)
initBallGraphics stage =
  for (replicate 10 ballSize) \size -> do
    G.circle stage (G.Color 0xFFFFFF) size

initGame :: ∀ eff h
  . App.Stage
  → Eff (pixi :: PIXI, st :: ST h | eff) (STRef h Game)
initGame s = do
  gP1 <- G.rect s (G.Color 0xFFFFFF) paddleWidth paddleHeight
  gP2 <- G.rect s (G.Color 0xFFFFFF) paddleWidth paddleHeight
  pooled <- initBallGraphics s

  newSTRef { mode: Init
           , activeBalls: []
           , pooledBalls: pooled
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
           , score: { p1: 0, p2: 0 }
           , time: 0.0
           , untilNextBall: 3000.0
           }


-- ========================================
-- UPDATE

makeInp :: KeyboardST → UserInput
makeInp k =
  { p1: if pressed "KeyQ" k then -1.0
        else if pressed "KeyA" k then 1.0
        else 0.0
  , p2: if pressed "ArrowUp" k then -1.0
        else if pressed "ArrowDown" k then 1.0
        else 0.0
  , space: pressed "Space" k
  }

processUserInput :: Game → UserInput → Game
processUserInput g inp =
  case g.mode of
       Running ->
         g { p1 = g.p1 { dy = inp.p1 }
           , p2 = g.p2 { dy = inp.p2 }
           }
       otherwise ->
         if inp.space
           then g { mode = Running
                  , untilNextBall = 3000.0
                  , score = { p1: 0, p2: 0 }
                  }
           else g

processTimeDelta :: Game → Number → Game
processTimeDelta g dt =
  stepTime dt g
  # stepPlayer dt
  # stepBallsPos dt
  # stepScore
  # addNewBall

stepTime :: Number → Game → Game
stepTime dt g =
  g { time = g.time + dt
    , untilNextBall = max 0.0 (g.untilNextBall - 16.67 * dt)
    }

stepBallsPos :: Number → Game → Game
stepBallsPos dt g =
  g { activeBalls = stepSingleBall <$> g.activeBalls }

  where stepSingleBall b =
          stepPos dt b # collitionHandling

        collitionHandling b
          | intersect b g.p1 =
              b { dx = -b.dx, dy = b.dy }
          | intersect b g.p2 =
              b { dx = -b.dx, dy = b.dy }
          | b.y <= 0.0 =
              b { dy = -b.dy, y = 0.0 }
          | b.y + b.h >= fieldHeight =
              b { dy = -b.dy, y = fieldHeight - b.h }
          | otherwise = b

stepScore :: Game → Game
stepScore g =
  foldl stepSingleBall (g { activeBalls = []}) g.activeBalls

  where stepSingleBall res b =
          let { s1, s2 } = score b
              scored = s1 > 0 || s2 > 0
              s = { p1: g.score.p1 + s1
                  , p2: g.score.p2 + s2
                  }
              mode = if s.p1 >= 10 then P1Win
                       else if s.p2 >= 10 then P2Win
                       else res.mode
           in res { activeBalls = if scored
                                    then res.activeBalls
                                    else snoc res.activeBalls b
                  , pooledBalls = if scored
                                    then snoc res.pooledBalls b.pixiRef
                                    else res.pooledBalls
                  , score = s
                  , mode = mode
                  }


score :: GameObj → { s1 :: Int, s2 :: Int }
score ball
  | ball.x <= 0.0 = { s1: 0, s2: 1 }
  | ball.x + ball.w >= fieldWidth = { s1: 1, s2: 0 }
  | otherwise = { s1: 0, s2: 0 }

addNewBall :: Game → Game
addNewBall g =
  addNewBallImpl g (uncons g.pooledBalls) (g.untilNextBall <= 0.0)

addNewBallImpl ::
  Game → Maybe { head :: G.Ref, tail :: Array G.Ref } → Boolean → Game
addNewBallImpl g Nothing _ = g
addNewBallImpl g _ false = g
addNewBallImpl g (Just { head: r, tail: rs }) _ =
  g { activeBalls = snoc g.activeBalls $ initBall g.time r
    , pooledBalls = rs
    , untilNextBall = 10000.0
    }

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

stepPlayer :: Number → Game → Game
stepPlayer dt g =
  g { p1 = stepSinglePlayer g.p1
    , p2 = stepSinglePlayer g.p2
    }
    where stepSinglePlayer p =
            let y = p.y + 5.0 * p.dy * dt
             in p { y = Math.max 0.0 (Math.min (fieldHeight - p.h) y)
                  , dy = 0.0
                  }


-- ========================================
-- VIEW

renderVDom :: String → Game → I.VDom ()
renderVDom r g =
  { vnode: renderNode g, root: r }

renderNode :: Game → I.VNode
renderNode g =
  I.div []
    [ I.div [ I.id "score" ]
      [ I.text ((show g.score.p1) <> " : " <> (show g.score.p2)) ]
    , renderInfo g.mode
    , I.div [ I.id "until-next-info" ]
      [ I.text $ untilNextInS <> "s until next ball" ]
    ]
    where untilNextInS = show $ round (g.untilNextBall / 1000.0)

renderInfo :: GameMode → I.VNode
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
  G.setPos $ g.activeBalls <> [g.p1, g.p2]


-- ========================================
-- MAIN (plugging all parts together)

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

      inputS :: Stream UserInput
      inputS = makeInp <$> fromEff keyboard

  (combine processUserInput gameS inputS)
    <#> processTimeDelta
    <#> (\f -> f >>> writeSTRef gameStateRef)
    # sampleBy tact
  gameS <#> renderVDom "#ui" <#> I.render # sample tact
  gameS <#> updatePos # sample tact
