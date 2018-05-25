module Test.Main where

import Prelude

import Control.Monad.Eff (Eff)
import Test.Spec.Reporter.Console (consoleReporter)
import Test.Spec.Runner (RunnerEffects, run)

import Test.Alchemy.FRP.TimeFunction as TimeFunction
import Test.Alchemy.FRP.ReactiveValue as ReactiveValue

main :: Eff (RunnerEffects ()) Unit
main = run [consoleReporter] do
  TimeFunction.tests
  ReactiveValue.tests
