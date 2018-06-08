module Test.Alchemy.FRP.Behavior
  ( tests
  ) where

import Prelude

import Alchemy.FRP.Event (openChannel, subscribe, send)
import Alchemy.FRP.Behavior (Behavior, map2, fromEff, sampleNow, sample, sampleBy)
import Control.Monad.Aff (Aff)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Unsafe (unsafePerformEff)
import Control.Monad.ST (ST, STRef, newSTRef, readSTRef, writeSTRef)
import Control.Monad.State (StateT)
import Data.Identity (Identity)
import Test.Spec (Group, describe, it)
import Test.Spec.Assertions (shouldEqual)

tests :: forall t1. StateT (Array (Group (Aff t1 Unit))) Identity Unit
tests =
  describe "Alchemy.FRP.TimeFunction" do
    describe "smart constructors" do
      it "allows to create constant functions from pure values" do
        let s1 = pure "foo" :: Behavior String
            s2 = pure "bar" :: Behavior String

        unsafePerformEff (do
          valOfS1 <- sampleNow s1
          valOfS2 <- sampleNow s2
          pure (valOfS1 <> valOfS2)) `shouldEqual` "foobar"

      it "allows to create time functions from effects" do
        unsafePerformEff (do
          r <- newSTRef { foo: "FOO" }
          sampleNow (fromEff $ readSTRef r <#> _.foo)) `shouldEqual` "FOO"

    describe "as a Functor" do
      it "supports '<$>'" do
        unsafePerformEff (do
          let s = pure 1 :: Behavior Int
              s' = (\x -> x + 1) <$> s
          sampleNow s') `shouldEqual` 2

      it "supports '<#>'" do
        unsafePerformEff (do
          let s = pure 1 :: Behavior Int
              s' = s <#> (\x -> x + 1)
          sampleNow s') `shouldEqual` 2

      it "satifies the identity law"
         let s = pure 1
             sid = id s :: Behavior Int
             smapid = id <$> s :: Behavior Int
             v1 = unsafePerformEff $ sampleNow sid
             v2 = unsafePerformEff $ sampleNow smapid
          in
         v1 `shouldEqual` v2

      it "satifies the composition law" do
         let s = pure "X"
             f = \x -> "foo(" <> x <> ")"
             g = \x -> "bar(" <> x <> ")"
             s1 = map (f <<< g) s
             s2 = (map f <<< map g) s
             v1 = unsafePerformEff $ sampleNow s1
             v2 = unsafePerformEff $ sampleNow s2

         v1 `shouldEqual` "foo(bar(X))"
         v1 `shouldEqual` v2

    describe "sampling" do
      it "can sample a time function of effects by an event" do
        unsafePerformEff (do
          { send: c, event: eIn } <- openChannel
          r <- newSTRef ""
          b <- pure $ pure "foo"
          eOut <- pure $ sample b eIn
          unsubscribe <- subscribe eOut (collect r)
          send c "foo"
          send c "bar"
          send c "baz"
          unsubscribe -- no further changes
          send c "ping"
          readSTRef r) `shouldEqual` "foofoofoo"

      it "can sample a time function of effects by an event using the event data" do
        unsafePerformEff (do
          { send: c, event: eIn } <- openChannel
          r <- newSTRef ""
          b <- pure $ pure (\s -> "<foo" <> s <> ">")
          eOut <- pure $ sampleBy b eIn
          unsubscribe <- subscribe eOut (collect r)
          send c "bar"
          send c "baz"
          readSTRef r) `shouldEqual` "<foobar><foobaz>"

    describe "map2" do
      it "allows to merge two streams into one" do
        let sa = pure 1
            sb = pure 2
            sc = map2 (\a b -> a + b) sa sb
            v = unsafePerformEff $ sampleNow sc

        v `shouldEqual` 3

collect ::
  ∀ e h. STRef h String -> String -> Eff (st :: ST h | e) String
collect r x = do
  s <- readSTRef r
  writeSTRef r (s <> x)
