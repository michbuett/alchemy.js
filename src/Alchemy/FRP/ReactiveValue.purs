module Alchemy.FRP.ReactiveValue
  ( RV
  , step
  , constant
  , run
  , inspect
  , testRV
  , simpleMap
  ) where

import Prelude

import Alchemy.FRP.Channel (Channel)
import Control.Monad.Eff (Eff)
import Data.Function.Uncurried (Fn2, runFn2)

foreign import data RV :: Type → Type

foreign import mapImpl :: ∀ a b.  Fn2 (a → b) (RV a) (RV b)

instance mapRV :: Functor RV where
  map = runFn2 mapImpl

foreign import applyImpl :: ∀ a b.  Fn2 (RV (a → b)) (RV a) (RV b)

instance applyRV :: Apply RV where
  apply = runFn2 applyImpl

foreign import constant :: ∀ a. a → RV a

instance applicativeRV :: Applicative RV where
  pure = constant

foreign import bindImpl :: ∀ a b.  Fn2 (RV a) (a → RV b) (RV b)

instance bindRV :: Bind RV where
  bind = runFn2 bindImpl

foreign import step :: ∀ a. a → Channel a → RV a

foreign import run :: ∀ e a. RV (Eff e a) → Eff e Unit

foreign import inspect :: ∀ e a. RV a → Eff e a

foreign import merge :: ∀ a. RV a → RV a → RV a

foreign import testRV :: ∀ a e. RV a → Eff e Unit

foreign import simpleMap :: ∀ a b. (a → b) → RV a → RV b
