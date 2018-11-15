module Test.Alchemy.Data.Incremental
  where

import Prelude

import Alchemy.Data.Incremental (patch, value)
import Alchemy.Data.Incremental.Array (ArrayUpdate(..), array)
import Alchemy.Data.Incremental.Atomic (Atomic(..), AtomicUpdate(..), atomic, setValue)
import Alchemy.Data.Incremental.Record (record, mergeRec)
import Control.Monad.State (StateT)
import Data.Identity (Identity)
import Data.Maybe (Maybe(..))
import Effect.Aff (Aff)
import Test.Spec (Group, describe, it)
import Test.Spec.Assertions (shouldEqual)

tests :: StateT (Array (Group (Aff Unit))) Identity Unit
tests =
  describe "Alchemy.Data.Incremental" do
    describe "Atomic values" do
      it "allows patching simple atomic values" do
        let iv = atomic "Foo"
            incr = patch iv (setValue "Bar")

        (value $ iv)
          `shouldEqual` (Atomic "Foo")

        (value $ incr.new)
          `shouldEqual` (Atomic "Bar")

        (incr.delta)
          `shouldEqual` (Replace (Just "Foo") "Bar")

    describe "Arrays" do
      it "allows inserting values into arrays" do
        let a1 = array [ atomic 1, atomic 2 ]
            a2 = array [ atomic 1, atomic 2, atomic 3 ]

        (patch a1 (InsertAt 2 (atomic 3))).new `shouldEqual` a2

      it "allows removing values from arrays" do
        let a1 = array [ atomic 1, atomic 2, atomic 3]
            a2 = array [ atomic 1, atomic 3 ]

        (patch a1 (DeleteAt 1)).new `shouldEqual` a2

      it "allows updating values in arrays" do
        let a1 = array [ atomic 1, atomic 2]
            a2 = array [ atomic 1, atomic 3 ]

        (patch a1 (UpdateAt 1 (setValue 3))).new `shouldEqual` a2


    describe "Records" do
      it "allows patching records" do
        let r1 = { foo: atomic "Foo"
                 , bar: atomic "Bar"
                 , baz: atomic "Baz"
                 }

            r2 = { foo: atomic "FOOFOO"
                 , bar: atomic "Bar"
                 , baz: atomic "BAZBAZ"
                 }

            dr = mergeRec { foo: setValue "FOOFOO", baz: setValue "BAZBAZ" }

        (patch (record r1) dr).new `shouldEqual` record r2

      it "allows nested patches" do
        let r1 = record
                 { foo: atomic "Foo"
                 , bar: atomic "Bar"
                 , baz:
                   record
                   { ping: atomic "ping"
                   , pong: record { bla: atomic 42 }
                   }
                 }

            r2 = record
                 { foo: atomic "FOOFOO"
                 , bar: atomic "Bar"
                 , baz:
                   record
                   { ping: atomic "ping"
                   , pong: record { bla: atomic 4242 }
                   }
                 }

            dr = mergeRec
                 { foo: setValue "FOOFOO"
                 , baz: mergeRec { pong: mergeRec { bla: setValue 4242 }}
                 }

        (patch r1 dr).new `shouldEqual` r2

      it "allows nested patches of differnt types" do
        let r1 = record
                 { foo: atomic "Foo"
                 , bar: array [ record { ping: atomic "bing" }]
                 }

            r2 = record
                 { foo: atomic "Foo"
                 , bar: array [ record { ping: atomic "BONG" } ]
                 }

            dr = mergeRec
                 { bar: (UpdateAt 0 (mergeRec { ping: setValue "BONG" })) }

        (patch r1 dr).new `shouldEqual` r2


