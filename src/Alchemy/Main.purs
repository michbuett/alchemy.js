module Main where


import Prelude

import Alchemy.DOM as Dom
import Alchemy.DOM.Attributes as Attr
import Alchemy.DOM.Elements2 (div, text) as Elem
import Alchemy.DOM.Events.Keyboard (KeyboardST, keyboard, pressed)
import Alchemy.FRP.Channel (Channel)
import Alchemy.FRP.ReactiveValue (RV)
import Alchemy.FRP.Subscription (together)
import Alchemy.FRP.Time (tick)
import Alchemy.FRP.TimeFunction (TF, fromEff, map2, sampleBy, sampleRV)
import Alchemy.Graphics2d (Graphic, Options, defaults, render) as Gfx
import Alchemy.Graphics2d.Attributes (pos)
import Alchemy.Graphics2d.Colors (Color(..))
import Alchemy.Graphics2d.Container (box, array)
import Alchemy.Graphics2d.Shapes as S
import Control.Monad.Eff (Eff, kind Effect)
import Control.Monad.Eff.Console (CONSOLE)
import Control.Monad.ST (ST, STRef, newSTRef, readSTRef, writeSTRef)
import Data.Array (snoc)
import Data.Int (round)
import Data.Traversable (foldl)
import Math (sin, cos, min, max) as Math

data GameMode =
  Init | Running | P1Win | P2Win

type GameObj =
  { x :: Number
  , y :: Number
  , dx :: Number
  , dy :: Number
  , w :: Number
  , h :: Number
  }

type Game =
  { mode :: GameMode
  , balls :: Array GameObj
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

initBall :: Number → GameObj
initBall a =
  { x: (fieldWidth - ballSize) / 2.0
  , y: (fieldHeight - ballSize) / 2.0
  , dx: 6.0 * Math.cos(a)
  , dy: 6.0 * Math.sin(a)
  , w: ballSize
  , h: ballSize
  }

initGame :: ∀ e h. Eff (st :: ST h | e) (STRef h Game)
initGame = do
  newSTRef
    { mode: Init
    , balls: []
    , p1:
      { x: 1.0
      , y: (fieldHeight - paddleHeight) / 2.0
      , dx: 0.0
      , dy: 0.0
      , w: paddleWidth
      , h: paddleHeight
      }
    , p2:
      { x: fieldWidth - paddleWidth - 1.0
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
  g { balls = stepSingleBall <$> g.balls }

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
  foldl stepSingleBall (g { balls = []}) g.balls

  where stepSingleBall res b =
          let { s1, s2 } = score b
              scored = s1 > 0 || s2 > 0
              s = { p1: g.score.p1 + s1
                  , p2: g.score.p2 + s2
                  }
              mode = if s.p1 >= 10 then P1Win
                       else if s.p2 >= 10 then P2Win
                       else res.mode
           in res { balls = if scored
                              then res.balls
                              else snoc res.balls b
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
  if g.untilNextBall <= 0.0
    then g { balls = snoc g.balls $ initBall g.time
           , untilNextBall = 10000.0
           }
    else g
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

renderScene :: RV Game → Gfx.Graphic
renderScene game =
  box [ S.rect paddleProps [ pos $ game <#> _.p1 ]
      , S.rect paddleProps [ pos $ game <#> _.p2 ]
      , array renderBall (game <#> _.balls)
      ]
      where
        paddleProps :: S.Rect
        paddleProps =
          S.defaultRectProps { width = paddleWidth
                             , height = paddleHeight
                             }

        ballProps :: S.Circle
        ballProps =
          S.defaultCircleProps
            { radius = ballSize
            , fillColor = Color 0xFF5060
            }

        renderBall :: RV GameObj → Gfx.Graphic
        renderBall ball = S.circle ballProps [ pos ball ]


renderHUD :: RV Game → Dom.DOM
renderHUD game =
  Elem.div [] []
    [ Elem.div [ Attr.id $ pure "score" ] []
      [ Elem.text $ renderScore <$> game ]
    , Elem.div [ Attr.id $ pure "info-msg" , Attr.hidden $ isRunning <$> modeS ] []
      [ Elem.div [ Attr.className $ pure "title" ] []
        [ Elem.text $ renderInfoTitle <$> modeS ]
      , Elem.div [ Attr.className $ pure "subtitle" ] []
        [ Elem.text $ renderInfoSubtitle <$> modeS ]
      ]
    , Elem.div [ Attr.id $ pure "until-next-info" ] []
      [ Elem.text $ untilNextInS <$> game ]
    ]

    where modeS :: RV GameMode
          modeS = _.mode <$> game

          renderScore :: Game → String
          renderScore g =
            (show g.score.p1) <> " : " <> (show g.score.p2)

          isRunning :: GameMode → Boolean
          isRunning Running = true
          isRunning _ = false

          renderInfoTitle :: GameMode → String
          renderInfoTitle Init = "Welcome to PS-Pong!"
          renderInfoTitle Running = ""
          renderInfoTitle P1Win = "Player 1 wins!"
          renderInfoTitle P2Win = "Player 2 wins!"

          renderInfoSubtitle :: GameMode → String
          renderInfoSubtitle Init = "Press [Space] to start"
          renderInfoSubtitle Running = ""
          renderInfoSubtitle P1Win = "Press [Space] to restart"
          renderInfoSubtitle P2Win = "Press [Space] to restart"

          untilNextInS :: Game → String
          untilNextInS g =
            (show $ round (g.untilNextBall / 1000.0)) <> "s until next ball"

-- ========================================
-- MAIN (plugging all parts together)

gameOptions :: Gfx.Options
gameOptions = Gfx.defaults { width = 600, height = 400 }

main :: ∀ eff h.
  Eff ( st :: ST h
      , console :: CONSOLE
      | eff ) Unit
main = do
  animationFrame <- tick
  gameStateRef <- initGame
  runGame animationFrame gameStateRef

runGame :: ∀ eff h
  . Channel Number
  → STRef h Game
  → Eff ( st :: ST h
        , console :: CONSOLE
        | eff ) Unit
runGame animationFrame gameStateRef = do
  let gameS :: TF Game
      gameS = fromEff $ readSTRef gameStateRef

      gameRV :: RV Game
      gameRV = sampleRV gameS animationFrame

      inputS :: TF UserInput
      inputS = makeInp <$> fromEff keyboard


  void $ together [ (map2 processUserInput gameS inputS)
                        <#> processTimeDelta
                        <#> (\f -> f >>> writeSTRef gameStateRef)
                        # sampleBy animationFrame
                   , Gfx.render gameOptions "#field" (renderScene gameRV)
                   , Dom.render "#ui" (renderHUD gameRV)
                   ]

-- runInit :: ∀ eff h
--   . Channel GameMode
--   → Eff (st :: ST h | eff) Unit
-- runInit switchMode =
--   ?run
