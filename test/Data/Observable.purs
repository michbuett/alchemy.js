module Test.Alchemy.Data.Observable
  where

import Prelude

import Alchemy.Data.Incremental (Patch(..), Increment, patch)
import Alchemy.Data.Incremental.Array (snoc, updateAt)
import Alchemy.Data.Incremental.Atomic (set)
import Alchemy.Data.Incremental.Record (assign)
import Alchemy.Data.Incremental.Types (ArrayUpdate(..), AtomicUpdate(..), Change, toChange)
import Alchemy.Data.Observable (create, increments)
import Alchemy.FRP.Event (send, subscribe)
import Control.Monad.State (StateT)
import Data.Identity (Identity)
import Data.Maybe (Maybe(..))
import Data.Symbol (SProxy(..))
import Effect (Effect)
import Effect.Aff (Aff)
import Effect.Ref (Ref, modify, read, new)
import Effect.Unsafe (unsafePerformEffect)
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

        unsafePerformEffect (do
          { ov, sender } <- create (\a b -> patch (set a) b) "Foo"
          ref <- new []
          _ <- subscribe (increments ov) (collect ref)
          send sender "Bar"
          send sender "Baz"
          send sender "Baz" -- => no event if nothing is changed
          read ref
          ) `shouldEqual` expected

     it "allows to observe patching nested data structures" do
        let -- v :: R
            v =
              { foo: "Foo"
              , bar: [{ ping: "bing" }]
              }

            -- p1 :: Patch R
            p1 =
              assign { foo: set "FOOFOO" }

            -- p2 :: Patch DR R R
            p2 =
              assign { bar: snoc { ping: "bong" }}

            -- d3 :: RecordUpdate SomeRecord
            -- d3 = mergeRec { bar: InsertAt 1 (record { ping: atomic "Bang!"}) }

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
            -- expected :: Array (RecordUpdate SomeRecord)
            -- expected =
            --   [
            --     -- 1st update: "Foo" -> "FOOFOO"
            --     mergeRec { foo: Replace (Just "Foo") "FOOFOO" }
            --     -- 2nd update: "bing" -> "BOONG"
            --   , mergeRec
            --     { bar: UpdateAt 0 (mergeRec
            --                         { ping: Replace (Just "bing") "BOONG" })
            --     }
            --     -- 3rd update add "Bang!"
            --   , mergeRec { bar: InsertAt 1 (record { ping: atomic "Bang!"})}
            --   ]

        unsafePerformEffect (do
          ref <- new []
          { ov, sender } <- create patch v
          -- { ov, sender } <- create (\a b -> patch a b) v
          _ <- subscribe (increments ov) (collect ref)
          send sender p1
          send sender p2
          -- send sender d2
          -- send sender d3
          read ref
          -- ) `shouldEqual` []
          ) `shouldEqual` expected

     -- it "allows to observe subvalues of nested data structures" do
     --    let ivalue :: IRecord SomeRecord
     --        ivalue =
     --          record
     --          { foo: atomic "Foo"
     --          , bar: array [ record { ping: atomic "bing" }]
     --          }

     --        { oiValue, sender } = makeObservable ivalue

     --        sub = oiValue # get (SProxy :: SProxy "bar")

     --        d1 = UpdateAt 0 (mergeRec { ping: setValue "BOONG" })

     --        d2 = InsertAt 1 (record { ping: atomic "Bang!"})

     --        expectedSubUpdates =
     --          [ UpdateAt 0 (mergeRec { ping: Replace (Just "bing") "BOONG" })
     --          , InsertAt 1 (record { ping: atomic "Bang!"})
     --          ]

     --    unsafePerformEffect (do
     --      ref <- new []
     --      _ <- subscribe (updates sub) (collect ref)
     --      send sender (mergeRec { foo: setValue "ZOOM" })
     --      send sender (mergeRec { bar: d1 })
     --      send sender (mergeRec { bar: d2 })
     --      read ref
     --      ) `shouldEqual` expectedSubUpdates


collect :: ∀ a.
  Ref (Array a) -> a -> Effect Unit
collect r x = do
  _ <- modify (\s -> s <> [x]) r
  pure unit


-- type SomeRecord =
--   ( foo :: IAtomic String
--   , bar :: IArray (Record SomeOtherRecord) (RecordUpdate SomeOtherRecord)
--   )
--
-- type SomeOtherRecord =
--   ( ping :: IAtomic String )

type R =
  { foo :: String
  , bar :: Array { ping :: String }
  }

type DR = { foo :: Maybe (Change String)
  , bar :: Maybe (Array (ArrayUpdate (Change { ping :: Maybe (Change String)})))
  }

