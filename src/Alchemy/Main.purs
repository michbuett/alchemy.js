module Main where

import Prelude (Unit, bind, (<#>), (+), (-), (<>), show)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Console (CONSOLE)
import DOM (DOM)
import Signal (Signal, runSignal, sampleOn, map2, foldp)
import Signal.Time (every)
-- import Data.Int (decimal, toStringAs)
-- import Data.String (joinWith)

import Alchemy.DOM.KeyboardEvent (KeyboardEvent, key, onKeypressed, isPressed)
import Alchemy.DOM.Inferno (VNode, div, text, render)

foreign import debugLog :: forall a e. a -> Eff (console :: CONSOLE | e) Unit

data Control = Up | Down | NoOp

type Input =
  { time :: Number
  , paddle1 :: Control
  , paddle2 :: Control
  }

type State =
  { val1 :: Int
  , val2 :: Int
  }

input :: Number -> KeyboardEvent -> Input
input t ev =
  { time: t
  , paddle1: op (key "KeyW") (key "KeyS") ev
  , paddle2: op (key "ArrowUp") (key "ArrowDown") ev
  }
    where
      op upKey downKey e =
        if isPressed e upKey then Up
        else if isPressed e downKey then Down
        else NoOp

update :: Input -> State -> State
update i s =
  { val1: step i.paddle1 s.val1
  , val2: step i.paddle2 s.val2
  }
  where
    step Up val = val + 1
    step Down val = val - 1
    step NoOp val = val

view :: State -> VNode
view s = div []
  [ div [] [ text ("Value #1 = " <>  show s.val1 ) ]
  , div [] [ text ("Value #2 = " <>  show s.val2 ) ]
  ]


tact :: Signal Number
tact = every 33.3

main :: forall e. Eff (dom :: DOM | e) Unit
main = do
  keys <- onKeypressed
  let
    inSig = map2 input tact keys
    stateSig = foldp update { val1: 0, val2: 0 } inSig
    outSig = stateSig <#> view

  runSignal ((sampleOn tact outSig) <#> (render "#app"))
