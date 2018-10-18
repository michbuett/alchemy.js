module Test.Main where

import Prelude

import Effect (Effect)
import Test.Spec.Reporter.Console (consoleReporter)
import Test.Spec.Runner (run)

import Test.Alchemy.FRP.Behavior as Behavior
import Test.Alchemy.FRP.Event as Event
import Test.Alchemy.Data.Incremental as Incremental
import Test.Alchemy.Data.Observable as Observable

main :: Effect Unit
main = run [consoleReporter] do
  Behavior.tests
  Event.tests
  Incremental.tests
  Observable.tests
