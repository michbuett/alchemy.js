module Test.Alchemy.Data.Observable
  where

import Prelude

import Alchemy.Data.Incremental.Array (IArray, ArrayUpdate(..), array)
import Alchemy.Data.Incremental.Atomic (IAtomic, Atomic, atomic)
import Alchemy.Data.Incremental.Record (IRecord, RecordUpdate, record, mergeRec)
import Alchemy.Data.Observable (Update, get, makeObservable, updates)
import Alchemy.FRP.Event (send, subscribe)
import Control.Monad.State (StateT)
import Data.Identity (Identity)
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
        let iv = atomic "Foo"
            { oiValue, sender } = makeObservable iv
            expected = [(update "Foo" "Bar"), (update "Bar" "Baz")]

        unsafePerformEffect (do
          ref <- new []
          _ <- subscribe (updates oiValue) (collect ref)
          send sender "Bar"
          send sender "Baz"
          read ref
          ) `shouldEqual` expected

     it "allows to observe patching nested data structures" do
        let ivalue :: IRecord SomeRecord
            ivalue =
              record
              { foo: atomic "Foo"
              , bar: array [ record { ping: atomic "bing" }]
              }

            { oiValue, sender } = makeObservable ivalue

            d1 :: RecordUpdate SomeRecord
            d1 = mergeRec { foo: "FOOFOO" }

            d2 :: RecordUpdate SomeRecord
            d2 = mergeRec { bar: UpdateAt 0 (mergeRec { ping: "BOONG" }) }

            d3 :: RecordUpdate SomeRecord
            d3 = mergeRec { bar: InsertAt 1 (record { ping: atomic "Bang!"}) }

            expected =
              [
                -- 1st update: "Foo" -> "FOOFOO"
                { oldValue:
                  record
                  { foo: atomic "Foo"
                  , bar: array [ record { ping: atomic "bing" } ]
                  }
                , newValue:
                  record
                  { foo: atomic "FOOFOO"
                  , bar: array [ record { ping: atomic "bing" } ]
                  }
                , delta: d1
                },
                -- 2nd update: "bing" -> "BOONG"
                { oldValue:
                  record
                  { foo: atomic "FOOFOO"
                  , bar: array [ record { ping: atomic "bing" } ]
                  }
                , newValue:
                  record
                  { foo: atomic "FOOFOO"
                  , bar: array [ record { ping: atomic "BOONG" } ]
                  }
                , delta: d2
                },
                -- 3rd update add "Bang!"
                { oldValue:
                  record
                  { foo: atomic "FOOFOO"
                  , bar: array [ record { ping: atomic "BOONG" } ]
                  }
                , newValue:
                  record
                  { foo: atomic "FOOFOO"
                  , bar: array [ record { ping: atomic "BOONG" }
                               , record { ping: atomic "Bang!" } ]
                  }
                , delta: d3
                }
              ]

        unsafePerformEffect (do
          ref <- new []
          _ <- subscribe (updates oiValue) (collect ref)
          send sender d1
          send sender d2
          send sender d3
          read ref
          ) `shouldEqual` expected

     it "allows to observe subvalues of nested data structures" do
        let ivalue :: IRecord SomeRecord
            ivalue =
              record
              { foo: atomic "Foo"
              , bar: array [ record { ping: atomic "bing" }]
              }

            { oiValue, sender } = makeObservable ivalue

            sub = oiValue # get (SProxy :: SProxy "bar")

            d1 = UpdateAt 0 (mergeRec { ping: "BOONG" })

            d2 = InsertAt 1 (record { ping: atomic "Bang!"})

            expectedSubUpdates =
              [
                { oldValue:
                    array [ record { ping: atomic "bing" } ]
                , newValue:
                    array [ record { ping: atomic "BOONG" } ]
                , delta: d1
                },
                { oldValue:
                    array [ record { ping: atomic "BOONG" } ]
                , newValue:
                    array [ record { ping: atomic "BOONG" }
                          , record { ping: atomic "Bang!" } ]
                , delta: d2
                }
              ]

        unsafePerformEffect (do
          ref <- new []
          _ <- subscribe (updates sub) (collect ref)
          send sender (mergeRec { foo: "FOOFOO" })
          send sender (mergeRec { bar: d1 })
          send sender (mergeRec { bar: d2 })
          read ref
          ) `shouldEqual` expectedSubUpdates


collect :: ∀ a da.
  Ref (Array (Update a da))
  -> Update a da
  -> Effect Unit
collect r x = do
  _ <- modify (\s -> s <> [x]) r
  pure unit

update :: String -> String -> Update (Atomic String) String
update old new =
  { oldValue: atomic old , newValue: atomic new , delta: new }

type SomeRecord =
  ( foo :: IAtomic String
  , bar :: IArray (Record SomeOtherRecord) (RecordUpdate SomeOtherRecord)
  )

type SomeOtherRecord =
  ( ping :: IAtomic String )
