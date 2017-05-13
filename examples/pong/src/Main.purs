module Main where

import Prelude (Unit, bind, (-), (/), (<$>), (<*>))
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Timer (TIMER)
import DOM (DOM)
import Signal (Signal, foldp, runSignal)
import Signal.DOM (animationFrame, keyPressed)

import Model (GameInput, GameState, fieldHeight, fieldWidth, paddleWidth, paddleHeight)
import Update (gameLogic)

initialGameState :: GameState
initialGameState =
  { score:
    { player1: 0
    , player2: 0
  }
  , ball:
    { id: "ball"
    , x: fieldWidth / 2
    , y: fieldHeight / 2
    , vx: 5
    , vy: 5
  }
  , paddle1:
    { id: "paddle1"
    , x: 50
    , y: (fieldHeight - paddleHeight) / 2
  }
  , paddle2:
    { id: "paddle2"
    , x: fieldWidth - paddleWidth - 50
    , y: (fieldHeight - paddleHeight) / 2
  }
  , lastUpdate: 0.0
}

foreign import renderGameState :: forall e. GameState -> Eff (dom :: DOM | e) Unit

main :: forall e. Eff (dom :: DOM, timer :: TIMER | e) Unit
main = do
  keyUp <- keyPressed 38
  keyDown <- keyPressed 40
  keyQ <- keyPressed 81
  keyA <- keyPressed 65
  spacePressed <- keyPressed 65
  frames <- animationFrame

  let
    inputs :: Signal GameInput
    inputs = { time: _, p1KeyUp: _, p1KeyDown: _, p2KeyUp: _, p2KeyDown: _, spacePressed: _ } <$> frames <*> keyQ <*> keyA <*> keyUp <*> keyDown <*> spacePressed

    state :: Signal GameState
    state = foldp gameLogic initialGameState inputs

  runSignal (renderGameState <$> state)
