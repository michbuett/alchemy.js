module Main where

import Prelude
import Control.Monad.Eff
import Control.Monad.Eff.Console
import DOM
import Signal
import Signal.Time
import Signal.DOM
import Data.Int

import Alchemy.DOM
import Alchemy.Buffer
import Alchemy.Observable

type TestData =
  { foo :: String
  , count :: Int
  }

main :: Eff (console :: CONSOLE) Unit
main =
  let
    tact = every 1000.0

    testData :: TestData
    testData = { foo: "foo", count: 0 }

    v1 = initialize testData

    foldVal t d = d { count = d.count + 1 }

    state :: Observable TestData
    state = mutate foldVal tact v1

    logTest :: TestData -> Eff (console :: CONSOLE) Unit
    logTest d = log ("Foo=" <> d.foo <> ", Count=" <> (toStringAs decimal d.count))
  in
  run logTest state
