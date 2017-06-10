module Main where

import Prelude (Unit, bind, (<#>), (+), (-), (<>), show)
import Data.Array (foldl, snoc)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Console (CONSOLE)
import DOM (DOM)
import DOM.Event.Types (KeyboardEvent)
import DOM.Event.KeyboardEvent (code)
import Signal (Signal, runSignal, sampleOn, map2, foldp)
import Signal.Time (every)

import Alchemy.DOM.KeyboardEvent (keypressed)
import Alchemy.DOM.Inferno (VNode, div, text, render)

foreign import debugLog :: forall a e. a -> Eff (console :: CONSOLE | e) Unit

data Action = P1Up | P1Down | P2Up | P2Down

type Input =
  { time :: Number
  , actions :: Array Action
  }

type State =
  { val1 :: Int
  , val2 :: Int
  }

keymap :: Array KeyboardEvent -> Array Action
keymap pressedKeys = foldl keyToAction [] pressedKeys
  where
    keyToAction result ev =
      case code ev of
           "KeyW" -> snoc result P1Up
           "KeyS" -> snoc result P1Down
           "ArrowUp" -> snoc result P2Up
           "ArrowDown" -> snoc result P2Down
           _ -> result

mergeInputs :: Number -> Array Action -> Input
mergeInputs time actions = { time: time, actions: actions }

update :: Input -> State -> State
update i s = foldl applyAction s i.actions

applyAction :: State -> Action -> State
applyAction s P1Up = s { val1 =  s.val1 + 1 }
applyAction s P1Down = s { val1 = s.val1 - 1 }
applyAction s P2Up = s { val2 = s.val2 + 1 }
applyAction s P2Down = s { val2 = s.val2 - 1 }

view :: State -> VNode
view s = div []
  [ div [] [ text ("Value #1 = " <>  show s.val1 ) ]
  , div [] [ text ("Value #2 = " <>  show s.val2 ) ]
  ]

tact :: Signal Number
tact = every 33.3

main :: forall e. Eff (dom :: DOM | e) Unit
main = do
  actions <- keypressed keymap

  let
    inSig = sampleOn tact (map2 mergeInputs tact actions)
    stateSig = foldp update { val1: 0, val2: 0 } inSig
    outSig = stateSig <#> view

  runSignal (outSig <#> (render "#app"))
