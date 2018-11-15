module Test.Alchemy.Data.Observable
  where

import Prelude

import Alchemy.Data.Incremental.Array (IArray, ArrayUpdate(..), array)
import Alchemy.Data.Incremental.Atomic (AtomicUpdate(..), IAtomic, atomic, setValue)
import Alchemy.Data.Incremental.Record (IRecord, RecordUpdate, record, mergeRec)
import Alchemy.Data.Observable (get, makeObservable, updates)
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
        let iv = atomic "Foo"

            { oiValue, sender } = makeObservable iv

            expected =
              [ (Replace (Just "Foo") "Bar")
              , (Replace (Just "Bar") "Baz")
              ]

        unsafePerformEffect (do
          ref <- new []
          _ <- subscribe (updates oiValue) (collect ref)
          send sender (setValue "Bar")
          send sender (setValue "Baz")
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
            d1 = mergeRec { foo: setValue "FOOFOO" }

            d2 :: RecordUpdate SomeRecord
            d2 = mergeRec { bar: UpdateAt 0 (mergeRec { ping: setValue "BOONG" }) }

            d3 :: RecordUpdate SomeRecord
            d3 = mergeRec { bar: InsertAt 1 (record { ping: atomic "Bang!"}) }

            expected :: Array (RecordUpdate SomeRecord)
            expected =
              [
                -- 1st update: "Foo" -> "FOOFOO"
                mergeRec { foo: Replace (Just "Foo") "FOOFOO" }
                -- 2nd update: "bing" -> "BOONG"
              , mergeRec
                { bar: UpdateAt 0 (mergeRec
                                    { ping: Replace (Just "bing") "BOONG" })
                }
                -- 3rd update add "Bang!"
              , mergeRec { bar: InsertAt 1 (record { ping: atomic "Bang!"})}
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

            d1 = UpdateAt 0 (mergeRec { ping: setValue "BOONG" })

            d2 = InsertAt 1 (record { ping: atomic "Bang!"})

            expectedSubUpdates =
              [ UpdateAt 0 (mergeRec { ping: Replace (Just "bing") "BOONG" })
              , InsertAt 1 (record { ping: atomic "Bang!"})
              ]

        unsafePerformEffect (do
          ref <- new []
          _ <- subscribe (updates sub) (collect ref)
          send sender (mergeRec { foo: setValue "ZOOM" })
          send sender (mergeRec { bar: d1 })
          send sender (mergeRec { bar: d2 })
          read ref
          ) `shouldEqual` expectedSubUpdates


collect :: ∀ a.
  Ref (Array a) -> a -> Effect Unit
collect r x = do
  _ <- modify (\s -> s <> [x]) r
  pure unit


type SomeRecord =
  ( foo :: IAtomic String
  , bar :: IArray (Record SomeOtherRecord) (RecordUpdate SomeOtherRecord)
  )

type SomeOtherRecord =
  ( ping :: IAtomic String )
