module Test.Main where

import Prelude

import Effect (Effect)
import Test.Spec.Reporter.Console (consoleReporter)
import Test.Spec.Runner (run)

import Test.Alchemy.FRP.Behavior as Behavior
import Test.Alchemy.FRP.Event as Event

main :: Effect Unit
main = run [consoleReporter] do
  Behavior.tests
  Event.tests
