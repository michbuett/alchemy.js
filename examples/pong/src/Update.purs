module Update (gameLogic) where

import Prelude
import Signal.Time (Time)
import Model (Ball, GameInput, GameState, Paddle, fieldHeight, fieldWidth, paddleWidth, paddleHeight)

newBall :: Time -> Ball
newBall t =
  { id: "ball"
  , x: fieldWidth / 2
  , y: fieldHeight / 2
  , vx: 5
  , vy: 5
}

ballLogic :: Time -> Paddle -> Paddle -> Ball -> Ball
ballLogic t p1 p2 b =
  if b.y > fieldHeight then b { vy = -b.vy , y = fieldHeight }
  else if b.y < 0 then b { vy = -b.vy, y = 0 }
  else if hit p1 b then b { vx = abs b.vx, x = p1.x + 21 }
  else if hit p2 b then b { vx = - (abs b.vx), x = p2.x - 1 }
  else b { x = b.x + b.vx , y = b.y + b.vy }

paddleLogic :: Boolean -> Boolean -> Paddle -> Paddle
paddleLogic true _ p = p { y = max 0 (p.y - 5) }
paddleLogic _ true p = p { y = min (fieldHeight - paddleHeight) (p.y + 5) }
paddleLogic _ _ p = p

gameLogic :: GameInput -> GameState -> GameState
gameLogic input state =
  let
    b :: Ball
    b = ballLogic input.time state.paddle1 state.paddle2 state.ball

    score1 = if b.x > fieldWidth then 1 else 0
    score2 = if b.x < 0 then 1 else 0
  in
    state { ball = if score1 /= score2 then newBall input.time else b
          , lastUpdate = input.time
          , paddle1 = paddleLogic input.p1KeyUp input.p1KeyDown state.paddle1
          , paddle2 = paddleLogic input.p2KeyUp input.p2KeyDown state.paddle2
          , score =
            { player1: score1 + state.score.player1
            , player2: score2 + state.score.player2
          }
        }


hit :: Paddle -> Ball -> Boolean
hit p b =
  b.x >= p.x && b.x <= p.x + paddleWidth && b.y >= p.y && b.y <= p.y + paddleHeight


abs :: Int -> Int
abs a = if a < 0 then -a else a
