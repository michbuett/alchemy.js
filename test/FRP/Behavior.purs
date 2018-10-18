module Test.Alchemy.FRP.Behavior
  ( tests
  ) where

import Prelude

import Alchemy.FRP.Behavior (Behavior, map2, fromEff, sampleNow, sample, sampleBy)
import Alchemy.FRP.Event (openChannel, subscribe, send)
import Control.Monad.State (StateT)
import Data.Identity (Identity)
import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Ref (Ref, modify, read, new)
import Effect.Unsafe (unsafePerformEffect)
import Test.Spec (Group, describe, it)
import Test.Spec.Assertions (shouldEqual)

tests :: StateT (Array (Group (Aff Unit))) Identity Unit
tests =
  describe "Alchemy.FRP.TimeFunction" do
    describe "smart constructors" do
      it "allows to create constant functions from pure values" do
        let s1 = pure "foo" :: Behavior String
            s2 = pure "bar" :: Behavior String

        unsafePerformEffect (do
          valOfS1 <- sampleNow s1
          valOfS2 <- sampleNow s2
          pure (valOfS1 <> valOfS2)) `shouldEqual` "foobar"

      it "allows to create time functions from effects" do
        unsafePerformEffect (do
          r <- new { foo: "FOO" }
          sampleNow (fromEff $ read r <#> _.foo)) `shouldEqual` "FOO"

    describe "as a Functor" do
      it "supports '<$>'" do
        unsafePerformEffect (do
          let s = pure 1 :: Behavior Int
              s' = (\x -> x + 1) <$> s
          sampleNow s') `shouldEqual` 2

      it "supports '<#>'" do
        unsafePerformEffect (do
          let s = pure 1 :: Behavior Int
              s' = s <#> (\x -> x + 1)
          sampleNow s') `shouldEqual` 2

      it "satifies the identity law"
         let s = pure 1
             sid = identity s :: Behavior Int
             smapid = identity <$> s :: Behavior Int
             v1 = unsafePerformEffect $ sampleNow sid
             v2 = unsafePerformEffect $ sampleNow smapid
          in
         v1 `shouldEqual` v2

      it "satifies the composition law" do
         let s = pure "X"
             f = \x -> "foo(" <> x <> ")"
             g = \x -> "bar(" <> x <> ")"
             s1 = map (f <<< g) s
             s2 = (map f <<< map g) s
             v1 = unsafePerformEffect $ sampleNow s1
             v2 = unsafePerformEffect $ sampleNow s2

         v1 `shouldEqual` "foo(bar(X))"
         v1 `shouldEqual` v2

    describe "sampling" do
      it "can sample a time function of effects by an event" do
        unsafePerformEffect (do
          { sender: c, event: eIn } <- openChannel
          r <- new ""
          b <- pure $ pure "foo"
          eOut <- pure $ sample b eIn
          unsubscribe <- subscribe eOut (collect r)
          send c "foo"
          send c "bar"
          send c "baz"
          unsubscribe -- no further changes
          send c "ping"
          read r) `shouldEqual` "foofoofoo"

      it "can sample a time function of effects by an event using the event data" do
        unsafePerformEffect (do
          { sender: c, event: eIn } <- openChannel
          r <- new ""
          b <- pure $ pure (\s -> "<foo" <> s <> ">")
          eOut <- pure $ sampleBy b eIn
          unsubscribe <- subscribe eOut (collect r)
          send c "bar"
          send c "baz"
          read r) `shouldEqual` "<foobar><foobaz>"

    describe "map2" do
      it "allows to merge two streams into one" do
        let sa = pure 1
            sb = pure 2
            sc = map2 (\a b -> a + b) sa sb
            v = unsafePerformEffect $ sampleNow sc

        v `shouldEqual` 3

collect ::
  Ref String -> String -> Effect String
collect r x = do
  modify (\s -> s <> x) r
