module Test.Main where

import Prelude

import Control.Monad.Eff (Eff)
import Test.Spec.Reporter.Console (consoleReporter)
import Test.Spec.Runner (RunnerEffects, run)

import Test.Alchemy.FRP.Behavior as Behavior
import Test.Alchemy.FRP.Event as Event

main :: Eff (RunnerEffects ()) Unit
main = run [consoleReporter] do
  Behavior.tests
  Event.tests
