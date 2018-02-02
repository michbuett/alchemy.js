module Test.Main where

import Prelude
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Unsafe (unsafePerformEff)
import Control.Monad.ST (newSTRef, readSTRef, writeSTRef)
import Test.Spec (describe, it)
import Test.Spec.Assertions (shouldEqual)
import Test.Spec.Reporter.Console (consoleReporter)
import Test.Spec.Runner (RunnerEffects, run)

import Alchemy.FRP.Channel (channel, send)
import Alchemy.FRP.Stream (fromEff, sampleBy)

main :: Eff (RunnerEffects ()) Unit
main = run [consoleReporter] do
  describe "alchemy" do
    describe "streams" do
      it "allows safe local state mutation sampled by an event" do
        unsafePerformEff (do
          c <- channel
          r <- newSTRef 1
          sampleBy c (fromEff $ readSTRef r
                          <#> (\x y -> writeSTRef r (x + y)))
          send c 2
          send c 3
          readSTRef r) `shouldEqual` (1 + 2 + 3)
