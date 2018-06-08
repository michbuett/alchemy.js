module Test.Alchemy.FRP.Event
  ( tests
  ) where

import Prelude

import Alchemy.FRP.Event (Channel, dropRepeats, dropRepeats', filter, foldp, openChannel, send, subscribe)
import Control.Monad.Aff (Aff)
import Control.Monad.Eff.Unsafe (unsafePerformEff)
import Control.Monad.ST (newSTRef, readSTRef, writeSTRef)
import Control.Monad.State (StateT)
import Data.Identity (Identity)
import Test.Alchemy.FRP.TestUtils (testEvent)
import Test.Spec (Group, describe, it)
import Test.Spec.Assertions (shouldEqual)

tests :: forall t1. StateT (Array (Group (Aff t1 Unit))) Identity Unit
tests =
  describe "Alchemy.FRP.Event" do
    describe "smart constructors" do
      it "allows to create together with a channel function" do
        unsafePerformEff ( do
          ref <- newSTRef "foo"
          { send: s, event: e } :: Channel String String <- openChannel
          unsub <- subscribe e (\str -> writeSTRef ref str)
          send s "bar"
          unsub
          send s "baz"
          readSTRef ref
        ) `shouldEqual` "bar"

    describe "as a Functor" do
      it "supports '<$>' and '<#>'" do
        let f x = "f(" <> x <> ")"
            g x = "g(" <> x <> ")"
            xs = ["a", "b", "c"]
            expected = ["g(f(a))", "g(f(b))", "g(f(c))"]

        testEvent (\e -> g <$> f <$> e) xs
          `shouldEqual` expected

        testEvent (\event -> event <#> f <#> g ) xs
          `shouldEqual` expected

      it "satifies the identity law"
        let f x = "f(" <> x <> ")"
            g x = "g(" <> x <> ")"
            xs = ["foo", "bar", "baz"]
            v1 = testEvent (\e -> id e) xs
            v2 = testEvent (\e -> id <$> e) xs
          in
         v1 `shouldEqual` v2

      it "satifies the composition law"
        let f x = "f(" <> x <> ")"
            g x = "g(" <> x <> ")"
            xs = ["foo", "bar", "baz"]
            v1 = testEvent (\e -> map (f <<< g) e) xs
            v2 = testEvent (\e -> (map f <<< map g) e ) xs
          in
         v1 `shouldEqual` v2

      it "map does not 'swallow' pure values" do
        let e1 = pure "Test"
            e2 = (\s -> "!" <> s) <$> e1
            e3 = (\s -> s <> "!") <$> e2
            e4 = (\s -> "?" <> s <> "?") <$> e3

        testEvent (\_ -> e2) ["foo", "bar", "baz"]
          `shouldEqual` ["!Test"]
        testEvent (\_ -> e3) ["foo", "bar", "baz"]
          `shouldEqual` ["!Test!"]
        testEvent (\_ -> e4) ["foo", "bar", "baz"]
          `shouldEqual` ["?!Test!?"]


    describe "as an Applicative" do
      it "supports 'pure' and '<*>'"
        let x = ["foo", "bar", "baz"]
            v = testEvent (\e -> (<>) <$> e <*> pure "bar") x
          in
        v `shouldEqual` ["foobar", "barbar", "bazbar"]


      it "Associative composition: (<<<)<$>f<*>g<*>h = f<*>(g<*>h)" do
        let f x = "f(" <> x <> ")"
            g x = "g(" <> x <> ")"
            xs = ["foo", "bar", "baz"]
            left = testEvent (\e -> (<<<) <$> pure f <*> pure g <*> e) xs
            right = testEvent (\e -> pure f <*> (pure g <*> e)) xs
            expected = ["f(g(foo))", "f(g(bar))", "f(g(baz))"]

        left `shouldEqual` expected
        right `shouldEqual` expected


      it "Identity: (pure identity) <*> v = v"
        let right = [1, 2, 3]
            left = testEvent (\e -> (pure id) <*> e) right
        in
        left `shouldEqual` right

      it "Composition: (pure (<<<))<*>f<*>g<*>h = f<*>(g<*>h)" do
        let f x = "f(" <> x <> ")"
            g x = "g(" <> x <> ")"
            xs = ["foo", "bar", "baz"]
            left = testEvent (\e -> pure (<<<) <*> pure f <*> pure g <*> e) xs
            right = testEvent (\e -> pure f <*> (pure g <*> e)) xs
            expected = ["f(g(foo))", "f(g(bar))", "f(g(baz))"]

        -- test `shouldEqual` expected
        left `shouldEqual` expected
        right `shouldEqual` expected

      it "Homomorphism: (pure f) <*> (pure x) = pure (f x)"
        let f = (+) 1
            x = 10
            left = testEvent (\_ -> (pure f) <*> (pure x)) [42]
            right = testEvent (\_ -> pure (f x)) [42]
        in
        left `shouldEqual` right

      it "Interchange: u <*> (pure y) = (pure (_ $ y)) <*> u"
        let y = 10
            u = (+) 42
            left = testEvent (\e -> e <*> (pure y)) [u]
            right = testEvent (\e -> (pure (_ $ y)) <*> e) [u]
        in
        left `shouldEqual` right

    describe "folding" do
      it "allows to create events from past values" do
        let collect r x = (readSTRef r) >>= (\arr -> writeSTRef r (arr <> [x]))

            {v1, v2} = unsafePerformEff $ do
                       { send: sSource, event: eSource } <- openChannel
                       sink1Ref <- newSTRef [0]
                       sink2Ref <- newSTRef [0]
                       eFold <- pure $ foldp (+) 0 eSource
                       sink1 <- subscribe ((*) 10 <$> eFold) (collect sink1Ref)
                       sink2 <- subscribe ((*) 100 <$> eFold) (collect sink2Ref)
                       send sSource 1
                       send sSource 1
                       send sSource 1
                       send sSource 1
                       send sSource 1
                       sink1Val <- readSTRef sink1Ref
                       sink2Val <- readSTRef sink2Ref
                       pure { v1: sink1Val, v2: sink2Val }

        v1 `shouldEqual` [0,  10,  20,  30,  40,  50]
        v2 `shouldEqual` [0, 100, 200, 300, 400, 500]


    describe "filtering" do
      it "allows to filter event occurances with a filtering function" do
        let collect r x = (readSTRef r) >>= (\arr -> writeSTRef r (arr <> [x]))

            {v1, v2, v3} = unsafePerformEff $ do
                       { send: sSource, event: eSource } <- openChannel
                       sinkRef1 <- newSTRef []
                       sinkRef2 <- newSTRef []
                       sinkRef3 <- newSTRef []
                       eFilter1 <- pure $ filter (\i -> i >= 10) eSource
                       eFilter2 <- pure $ filter (\i -> i < 10) eSource
                       sink1 <- subscribe eFilter1 (collect sinkRef1)
                       sink2 <- subscribe eFilter2 (collect sinkRef2)
                       sink3 <- subscribe ((*) 2 <$> eFilter2) (collect sinkRef3)
                       send sSource 1
                       send sSource 5
                       send sSource 11
                       send sSource 25
                       send sSource 1
                       send sSource 15
                       sink1Val <- readSTRef sinkRef1
                       sink2Val <- readSTRef sinkRef2
                       sink3Val <- readSTRef sinkRef3
                       pure { v1: sink1Val, v2: sink2Val, v3: sink3Val }

        v1 `shouldEqual` [11, 25, 15]
        v2 `shouldEqual` [1, 5, 1]
        v3 `shouldEqual` [2, 10, 2]

      it "allows to drop repeating values" do
        let collect r x = (readSTRef r) >>= (\arr -> writeSTRef r (arr <> [x]))

            {v1, v2} = unsafePerformEff $ do
                       { send: sSource, event: eSource } <- openChannel
                       sinkRef1 <- newSTRef []
                       sinkRef2 <- newSTRef []
                       eFilter <- pure $ dropRepeats' eSource
                       sink1 <- subscribe ((+) 1 <$> eFilter) (collect sinkRef1)
                       sink2 <- subscribe ((*) 2 <$> eFilter) (collect sinkRef2)
                       send sSource 1
                       send sSource 1
                       send sSource 11
                       send sSource 25
                       send sSource 25
                       send sSource 15
                       sink1Val <- readSTRef sinkRef1
                       sink2Val <- readSTRef sinkRef2
                       pure { v1: sink1Val, v2: sink2Val }

        v1 `shouldEqual` [2, 12, 26, 16]
        v2 `shouldEqual` [2, 22, 50, 30]


      it "allows to drop repeating values (Eq type class)" do
        let collect r x = (readSTRef r) >>= (\arr -> writeSTRef r (arr <> [x]))

            {v1, v2} = unsafePerformEff $ do
                       { send: sSource, event: eSource } <- openChannel
                       sinkRef1 <- newSTRef []
                       sinkRef2 <- newSTRef []
                       eFilter <- pure $ dropRepeats eSource
                       sink1 <- subscribe ((+) 1 <$> eFilter) (collect sinkRef1)
                       sink2 <- subscribe ((*) 2 <$> eFilter) (collect sinkRef2)
                       send sSource 1
                       send sSource 1
                       send sSource 11
                       send sSource 25
                       send sSource 25
                       send sSource 15
                       sink1Val <- readSTRef sinkRef1
                       sink2Val <- readSTRef sinkRef2
                       pure { v1: sink1Val, v2: sink2Val }

        v1 `shouldEqual` [2, 12, 26, 16]
        v2 `shouldEqual` [2, 22, 50, 30]

