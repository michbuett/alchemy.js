module Main where

import Prelude (Unit, bind, (<#>), (+), (-), (<>), show)
import Data.Array (foldl, snoc)
import Control.Monad.Eff (Eff)
import DOM (DOM)
import DOM.Event.Types (KeyboardEvent)
import DOM.Event.KeyboardEvent (code)
import Signal (Signal, runSignal, sampleOn, map2, foldp)
import Signal.Time (every)

import Alchemy.DOM.KeyboardEvent (keypressed)
import Alchemy.DOM.Inferno (VNode, div, text, render)
-- import Alchemy.Pixi.Graphics

-------------------
-- ### INPUT ###
data Action = P1Up | P1Dn | P2Up | P2Dn

type Input =
  { time :: Number
  , actions :: Array Action
  }

keymap :: Array KeyboardEvent → Array Action
keymap pressedKeys = foldl keyToAction [] pressedKeys
  where
    keyToAction result ev =
      case code ev of
           "KeyW" -> snoc result P1Up
           "KeyS" -> snoc result P1Dn
           "ArrowUp" -> snoc result P2Up
           "ArrowDown" -> snoc result P2Dn
           _ -> result

mergeInputs :: Number → Array Action → Input
mergeInputs time actions = { time: time, actions: actions }

-------------------
-- ### STATE ###

type GameObject o =
  { id :: String
  , x :: Int
  , y :: Int
  , vx :: Int
  , vy :: Int
  , w :: Int
  , h :: Int
  | o }

type Ball = GameObject ()

type Player = GameObject ( score :: Int)

type GameState =
  { fieldWidth :: Int
  , fieldHeight :: Int
  , ball :: Ball
  , player1 :: Player
  , player2 :: Player
  , lastUpdate :: Number
  }


type State =
  { val1 :: Int
  , val2 :: Int
  }


update :: Input → State → State
update input state = foldl applyAction state input.actions
  where
    applyAction :: State → Action → State
    applyAction s P1Up = s { val1 = s.val1 + 1 }
    applyAction s P1Dn = s { val1 = s.val1 - 1 }
    applyAction s P2Up = s { val2 = s.val2 + 1 }
    applyAction s P2Dn = s { val2 = s.val2 - 1 }

view :: State → VNode
view s = div []
  [ div [] [ text ("Value #1 = " <>  show s.val1 ) ]
  , div [] [ text ("Value #2 = " <>  show s.val2 ) ]
  ]

color :: Int
color = 0x112233

main :: ∀ e. Eff (dom :: DOM | e) Unit
main = do
  actions <- keypressed keymap

  let
    tact :: Signal Number
    tact = every 33.3

    inSig :: Signal Input
    inSig = sampleOn tact (map2 mergeInputs tact actions)

    stateSig :: Signal State
    stateSig = foldp update { val1: 0, val2: 0 } inSig

    outSig :: Signal VNode
    outSig = stateSig <#> view

  runSignal (outSig <#> (render "#app"))
