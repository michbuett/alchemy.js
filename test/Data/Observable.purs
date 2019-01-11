module Test.Alchemy.Data.Observable
  where

import Prelude

import Alchemy.Data.Incremental (patch)
import Alchemy.Data.Incremental.Array (snoc)
import Alchemy.Data.Incremental.Atomic (set)
import Alchemy.Data.Incremental.Record (assign)
import Alchemy.Data.Incremental.Types (ArrayUpdate(..), AtomicUpdate(..), toChange)
import Alchemy.Data.Observable (constant, create, get, increments, mapOV, sample, values)
import Alchemy.FRP.Event (send, subscribe)
import Control.Monad.State (StateT)
import Data.Identity (Identity)
import Data.Maybe (Maybe(..))
import Data.Symbol (SProxy(..))
import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Effect.Ref as Ref
import Test.Spec (Group, describe, it)
import Test.Spec.Assertions (shouldEqual)

tests :: StateT (Array (Group (Aff Unit))) Identity Unit
tests =
  describe "Alchemy.Data.Observable" do
     it "allows to observe patching incremental values" do
        let expected =
              [ { new: "Bar", delta: Just $ toChange (Replace "Foo" "Bar") }
              , { new: "Baz", delta: Just $ toChange (Replace "Bar" "Baz") }
              ]

        actual <- liftEffect do
          { ov, sender } <- create (\a b -> patch (set a) b) "Foo"
          ref <- Ref.new []
          _ <- subscribe (increments ov) (collect ref)
          send sender "Bar"
          send sender "Baz"
          send sender "Baz" -- => no event if nothing is changed
          Ref.read ref

        actual `shouldEqual` expected

     it "allows to observe patching nested data structures" do
        let v =
              { foo: "Foo"
              , bar: [{ ping: "bing" }]
              }

            p1 =
              assign { foo: set "FOOFOO" }

            p2 =
              assign { bar: snoc { ping: "bong" }}

            expected =
              [ { new:
                  { foo: "FOOFOO"
                  , bar: [{ ping: "bing" }]
                  }
                , delta: Just $ toChange
                  { foo: Just $ toChange (Replace "Foo" "FOOFOO")
                  , bar: Nothing
                  }
                }
              , { new:
                  { foo: "FOOFOO"
                  , bar: [ { ping: "bing" }
                         , { ping: "bong" }
                         ]
                  }
                , delta: Just $ toChange
                  { foo: Nothing
                  , bar: Just $ toChange [ InsertAt 1 { ping: "bong" } ]
                  }
                }
              ]

        actual <- liftEffect do
          ref <- Ref.new []
          { ov, sender } <- create patch v
          _ <- subscribe (increments ov) (collect ref)
          send sender p1
          send sender p2
          Ref.read ref

        actual  `shouldEqual` expected

     it "allows to observe subvalues of nested data structures" do
        let r = { foo: "Foo", bar: "Bar" }

            expected =
              [ { new: "Foo2"
                , delta: Just $ toChange (Replace "Foo" "Foo2")
                }
              ]

        actual <- liftEffect do
          ref <- Ref.new []
          { ov, sender } <- create patch r
          sub <- pure $ get (SProxy :: SProxy "foo") ov
          unsub <- subscribe (increments sub) (collect ref)
          sender $ assign { foo: set "Foo2" }
          sender $ assign { bar: set "Bar2" }
          unsub
          -- no further updates after canceling subscription
          sender $ assign { foo: set "Foo3" }
          Ref.read ref

        actual `shouldEqual` expected


     it "allows to map observable values" do
        let ov1 = constant 1
            ov2 = mapOV show ov1
            expected =
              [ { new: "1"
                , delta: Just $ toChange (Replace "0" "1")
                }
              , { new: "2"
                , delta: Just $ toChange (Replace "1" "2")
                }
              , { new: "3"
                , delta: Just $ toChange (Replace "2" "3")
                }
              ]

        v1 <- liftEffect $ sample ov1
        v2 <- liftEffect $ sample ov2
        v3 <- liftEffect do
          ref <- Ref.new []
          { ov, sender } <- create patch 0
          ov3 <- pure $ mapOV show ov
          _ <- subscribe (increments ov3) (collect ref)
          sender $ set 1
          sender $ set 1
          sender $ set 1
          sender $ set 2
          sender $ set 3
          sender $ set 3
          Ref.read ref

        v1 `shouldEqual` 1
        v2 `shouldEqual` "1"
        v3 `shouldEqual` expected


collect :: ∀ a. Ref.Ref (Array a) -> a -> Effect Unit
collect r x = do
  _ <- Ref.modify (\s -> s <> [x]) r
  pure unit
