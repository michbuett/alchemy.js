module Test.Alchemy.FRP.TimeFunction
  ( tests
  ) where

import Prelude

import Alchemy.FRP.Channel (channel, send)
import Alchemy.FRP.TimeFunction (TF, combine, fromChannel, fromEff, fromVal, inspect, sample, sampleBy)
import Control.Monad.Aff (Aff)
import Control.Monad.Eff.Unsafe (unsafePerformEff)
import Control.Monad.ST (newSTRef, readSTRef, writeSTRef)
import Control.Monad.State (StateT)
import Data.Identity (Identity)
import Test.Spec (Group, describe, it)
import Test.Spec.Assertions (shouldEqual)

tests :: forall t1. StateT (Array (Group (Aff t1 Unit))) Identity Unit
tests =
  describe "Alchemy.FRP.TimeFunction" do
    describe "smart constructors" do
      it "allows to create streams from pure values" do
        let s1 = fromVal "foo" :: TF String
            s2 = pure "bar" :: TF String

        unsafePerformEff (do
          valOfS1 <- inspect s1
          valOfS2 <- inspect s2
          pure (valOfS1 <> valOfS2)) `shouldEqual` "foobar"

      it "allows to create streams from effects" do
        unsafePerformEff (do
          r <- newSTRef { foo: "FOO" }
          inspect (fromEff $ readSTRef r <#> _.foo)) `shouldEqual` "FOO"

      it "allows to create streams from channels" do
        unsafePerformEff (do
          c <- channel
          s <- pure (fromChannel c 1)
          send c 2
          send c 3
          inspect s) `shouldEqual` 3

    describe "as a Functor" do
      it "supports '<$>'" do
        unsafePerformEff (do
          let s = pure 1 :: TF Int
              s' = (\x -> x + 1) <$> s
          inspect s') `shouldEqual` 2

      it "supports '<#>'" do
        unsafePerformEff (do
          let s = pure 1 :: TF Int
              s' = s <#> (\x -> x + 1)
          inspect s') `shouldEqual` 2

      it "satifies the identity law"
         let s = pure 1
             sid = id s :: TF Int
             smapid = id <$> s :: TF Int
             v1 = unsafePerformEff $ inspect sid
             v2 = unsafePerformEff $ inspect smapid
          in
         v1 `shouldEqual` v2

      it "satifies the composition law" do
         let s = pure "X"
             f = \x -> "foo(" <> x <> ")"
             g = \x -> "bar(" <> x <> ")"
             s1 = map (f <<< g) s
             s2 = (map f <<< map g) s
             v1 = unsafePerformEff $ inspect s1
             v2 = unsafePerformEff $ inspect s2

         v1 `shouldEqual` "foo(bar(X))"
         v1 `shouldEqual` v2

    describe "sampling" do
      it "can sample a time function of effects by an event" do
        unsafePerformEff (do
          c <- channel
          r <- newSTRef 0
          s <- pure (fromEff $ readSTRef r <#> \n -> writeSTRef r (n + 1))
          sample c s
          send c 0
          send c 0
          send c 0
          readSTRef r) `shouldEqual` 3

      it "can sample a time function of effects by an event using the event data" do
        unsafePerformEff (do
          c <- channel
          r <- newSTRef 1
          sampleBy c (fromEff $ readSTRef r
                          <#> (\x y -> writeSTRef r (x + y)))
          send c 2
          send c 3
          readSTRef r) `shouldEqual` (1 + 2 + 3)

    describe "combine" do
      it "allows to merge two streams into one" do
        let sa = pure 1
            sb = pure 2
            sc = combine (\a b -> a + b) sa sb
            v = unsafePerformEff $ inspect sc

        v `shouldEqual` 3
