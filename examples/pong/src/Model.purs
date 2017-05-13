module Model
  ( GameInput
  , GameState
  , Ball, Score
  , GameObject
  , Paddle
  , Command(..)
  , fieldWidth
  , fieldHeight
  , paddleWidth
  , paddleHeight
  ) where

import Signal.Time (Time)

type GameObject o =
  { id :: String
  , x :: Int
  , y :: Int
  | o
}

type Ball = GameObject
  ( vx :: Int
  , vy :: Int
)

type Paddle = GameObject ()

data Command = Up | Down | NoOp

type Score =
  { player1 :: Int
  , player2 :: Int
}

type GameInput =
  { time :: Time
  , p1KeyUp :: Boolean
  , p1KeyDown :: Boolean
  , p2KeyUp :: Boolean
  , p2KeyDown :: Boolean
  , spacePressed :: Boolean
}

type GameState =
  { score :: Score
  , ball:: Ball
  , paddle1 :: Paddle
  , paddle2 :: Paddle
  , lastUpdate :: Time
}

fieldWidth = 600 :: Int
fieldHeight = 400 :: Int

paddleWidth = 20 :: Int
paddleHeight = 100 :: Int
