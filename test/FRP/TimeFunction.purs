module Test.Alchemy.FRP.TimeFunction
  ( tests
  ) where

import Prelude

import Alchemy.FRP.Channel (channel, send)
import Alchemy.FRP.ReactiveValue (createRV)
import Alchemy.FRP.TimeFunction (TF, map2, stepTF, fromEff, constantTF, inspectTF, sample, sampleBy, createTF)
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
      it "allows to create constant functions from pure values" do
        let s1 = constantTF "foo" :: TF String
            s2 = pure "bar" :: TF String

        unsafePerformEff (do
          valOfS1 <- inspectTF s1
          valOfS2 <- inspectTF s2
          pure (valOfS1 <> valOfS2)) `shouldEqual` "foobar"

      it "allows to create time functions together with a setValue function" do
        unsafePerformEff (do
          { tf, setValue } <- createTF "foo"
          setValue "bar"
          inspectTF tf) `shouldEqual` "bar"

      it "allows to create time functions from effects" do
        unsafePerformEff (do
          r <- newSTRef { foo: "FOO" }
          inspectTF (fromEff $ readSTRef r <#> _.foo)) `shouldEqual` "FOO"

      it "allows to create step function from reactive values" do
        unsafePerformEff (do
          { rv, setValue } <- createRV 1
          tf <- pure (stepTF rv)
          setValue 2
          setValue 3
          inspectTF tf) `shouldEqual` 3

    describe "as a Functor" do
      it "supports '<$>'" do
        unsafePerformEff (do
          let s = pure 1 :: TF Int
              s' = (\x -> x + 1) <$> s
          inspectTF s') `shouldEqual` 2

      it "supports '<#>'" do
        unsafePerformEff (do
          let s = pure 1 :: TF Int
              s' = s <#> (\x -> x + 1)
          inspectTF s') `shouldEqual` 2

      it "satifies the identity law"
         let s = pure 1
             sid = id s :: TF Int
             smapid = id <$> s :: TF Int
             v1 = unsafePerformEff $ inspectTF sid
             v2 = unsafePerformEff $ inspectTF smapid
          in
         v1 `shouldEqual` v2

      it "satifies the composition law" do
         let s = pure "X"
             f = \x -> "foo(" <> x <> ")"
             g = \x -> "bar(" <> x <> ")"
             s1 = map (f <<< g) s
             s2 = (map f <<< map g) s
             v1 = unsafePerformEff $ inspectTF s1
             v2 = unsafePerformEff $ inspectTF s2

         v1 `shouldEqual` "foo(bar(X))"
         v1 `shouldEqual` v2

    describe "sampling" do
      it "can sample a time function of effects by an event" do
        unsafePerformEff (do
          c <- channel
          r <- newSTRef 0
          s <- pure (fromEff $ readSTRef r <#> \n -> writeSTRef r (n + 1))
          unsubscribe <- sample c s
          send c 0
          send c 0
          send c 0
          unsubscribe -- no further changes
          send c 0
          readSTRef r) `shouldEqual` 3

      it "can sample a time function of effects by an event using the event data" do
        unsafePerformEff (do
          c <- channel
          r <- newSTRef 1
          _ <- sampleBy c (fromEff $ readSTRef r
                          <#> (\x y -> writeSTRef r (x + y)))
          send c 2
          send c 3
          readSTRef r) `shouldEqual` (1 + 2 + 3)

    describe "map2" do
      it "allows to merge two streams into one" do
        let sa = pure 1
            sb = pure 2
            sc = map2 (\a b -> a + b) sa sb
            v = unsafePerformEff $ inspectTF sc

        v `shouldEqual` 3
