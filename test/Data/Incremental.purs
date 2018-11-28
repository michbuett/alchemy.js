module Test.Alchemy.Data.Incremental
  where

import Prelude

import Alchemy.Data.Incremental (Increment, patch)
import Alchemy.Data.Incremental.Array (cons, snoc, uncons, unsnoc, updateAt)
import Alchemy.Data.Incremental.Atomic (Atomic(..), replaceWith, set)
import Alchemy.Data.Incremental.Record (assign)
import Alchemy.Data.Incremental.Types (ArrayUpdate(..), AtomicUpdate(..), toChange)
import Control.Monad.State (StateT)
import Data.Identity (Identity)
import Data.Maybe (Maybe(..))
import Effect.Aff (Aff)
import Test.Spec (Group, describe, it)
import Test.Spec.Assertions (shouldEqual)

tests :: StateT (Array (Group (Aff Unit))) Identity Unit
tests =
  describe "Alchemy.Data.Incremental2" do
    describe "Atomic values" do
      it "allows patching (=replacing) simple (=atomic) values" do
        (patch (set $ Atomic "Bar") (Atomic "Foo"))
          `shouldEqual`
            { new: Atomic "Bar"
            , delta: Just $ toChange (Replace (Atomic "Foo") (Atomic "Bar"))
            }

        (patch (set 2) 1)
          `shouldEqual` { new: 2, delta: Just $ toChange (Replace 1 2) }

        (patch (set 2.0) 1.0)
          `shouldEqual` { new: 2.0, delta: Just $ toChange (Replace 1.0 2.0) }

        (patch (set true) false)
          `shouldEqual` { new: true, delta: Just $ toChange (Replace false true) }

        (patch (set "Bar") "Foo")
          `shouldEqual` { new: "Bar", delta: Just $ toChange (Replace "Foo" "Bar") }

        (patch (set "Bar") "Bar")
          `shouldEqual` { new: "Bar", delta: Nothing }

    describe "Arrays" do
      it "allows inserting values into arrays" do
        let a = [ 1, 2 ]

            -- p1 :: PArray Int (AtomicUpdate Int)
            p1 = cons 3

            -- p2 :: PArray Int (AtomicUpdate Int)
            p2 = snoc 3

            expected1 = { new: [ 3, 1, 2 ], delta: Just $ toChange [ InsertAt 0 3 ] }
            expected2 = { new: [ 1, 2, 3 ], delta: Just $ toChange [ InsertAt 2 3 ] }

        (patch p1 a) `shouldEqual` expected1
        (patch p2 a) `shouldEqual` expected2

      it "allows removing values from arrays" do
        let a1 = [ 1, 2, 3 ]
            a2 = [] :: Array Int

            p1 = uncons

            p2 = unsnoc

            expected1 = { new: [ 2, 3 ], delta: Just $ toChange [ DeleteAt 0 ] }
            expected2 = { new: [], delta: Nothing }
            expected3 = { new: [ 1, 2 ], delta: Just $ toChange [ DeleteAt 2 ] }
            expected4 = { new: [], delta: Nothing }

        (patch p1 a1) `shouldEqual` expected1
        (patch p1 a2) `shouldEqual` expected2
        (patch p2 a1) `shouldEqual` expected3
        (patch p2 a2) `shouldEqual` expected4

      it "allows mapping array items" do
        let a = [ 1, 2, 3 ]


            p1 = updateAt 1 (\x -> replaceWith (10 * x) x)
            p2 = updateAt 10 (\x -> replaceWith (10 * x) x)
            p3 = updateAt 1 (\x -> replaceWith x x)

            expected1 =
              { new: [1, 20, 3]
              , delta: Just $ toChange [ UpdateAt 1 (toChange $ Replace 2 20) ]
              -- , delta: Just $ toChange [ UpdateAt 1 (Replace 2 20) ]
              }
            expected2 =
              { new: a
              , delta: Nothing
              }

        (patch p1 a) `shouldEqual` expected1
        (patch p2 a) `shouldEqual` expected2
        (patch p3 a) `shouldEqual` expected2


    describe "Records" do
      it "allows patching simple (flat) records" do
        let r = { foo: "Foo1" , bar: "Bar1" , baz: "Baz1" }

            p = assign { foo: set "Foo2", bar: set "Bar2" }

            expected :: Increment { foo :: String, bar :: String, baz :: String }
            expected =
              { new:
                { foo: "Foo2"
                , bar: "Bar2"
                , baz: "Baz1"
                }
              , delta:
                Just $ toChange
                  { foo: Just $ toChange (Replace "Foo1" "Foo2")
                  , bar: Just $ toChange (Replace "Bar1" "Bar2")
                  , baz: Nothing
                  }
              }

        (patch p r) `shouldEqual` expected


      it "allows patching nested records" do
        let r = { foo: "Foo1"
                , bar:
                  { ping: "Ping1"
                  , pong: { bla: "Bla1" }
                  }
                }

            p = assign
                { bar:
                    assign
                    { ping: set "Ping2"
                    , pong: assign { bla: set "Bla2" }
                    }
                }

            expected =
              { new:
                { foo: "Foo1"
                , bar:
                  { ping: "Ping2"
                  , pong: { bla: "Bla2" }
                  }
                }
              , delta:
                Just $ toChange
                { foo: Nothing
                , bar:
                  Just $ toChange
                  { ping:
                    Just $ toChange (Replace "Ping1" "Ping2")
                  , pong:
                    Just $ toChange { bla: Just $ toChange (Replace "Bla1" "Bla2") }
                  }
                }
              }

        (patch p r)`shouldEqual` expected

      it "tracks unchanged values when patching records" do
        let r = { foo: { bar: { k1: "v1" , k2: "v2" }}}

            p1 =
              assign
              { foo: assign { bar: assign { k1: set "v1", k2: set "new v2" }}}

            p2 =
              assign
              { foo: assign { bar: assign { k1: set "v1", k2: set "v2" }}}

            expected1 =
              { new: { foo: { bar: { k1: "v1" , k2: "new v2" }}}
              , delta:
                Just $ toChange { foo:
                  Just $ toChange { bar:
                    Just $ toChange
                         { k1: Nothing
                         , k2: Just $ toChange (Replace "v2" "new v2")
                         }
                       }
                     }
              }

            expected2 =
              { new: { foo: { bar: { k1: "v1" , k2: "v2" }}}
              , delta: Nothing
              }

        (patch p1 r)`shouldEqual` expected1
        (patch p2 r)`shouldEqual` expected2


      it "allows nested patches of differnt types" do
        let r =
              { foo: "Foo", bar: [{ ping: "bing" }] }

            p =
              assign { bar: updateAt 0 (patch $ assign { ping: set "Bong!" }) }

            expected =
              { new:
                { foo: "Foo", bar: [{ ping: "Bong!" }] }
              , delta:
                Just $ toChange
                  { foo: Nothing
                  , bar: Just $ toChange
                    [ UpdateAt 0 (toChange { ping: Just $ toChange (Replace "bing" "Bong!") })]
                  }
              }

        (patch p r) `shouldEqual` expected
