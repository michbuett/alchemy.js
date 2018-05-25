module Alchemy.FRP.ReactiveValue
  ( RV
  , step
  , constant
  , run
  , inspect
  ) where

import Prelude

import Alchemy.FRP.Channel (Channel)
import Control.Monad.Eff (Eff)

foreign import data RV :: Type → Type

foreign import constant :: ∀ a. a → RV a

foreign import bindImpl :: ∀ a b.
  RV a → (a → RV b) → RV b

foreign import applyImpl :: ∀ a b.
  RV (a → b) → RV a → RV b

foreign import mapImpl :: ∀ a b.
  (a → b) → RV a → RV b

instance mapRV :: Functor RV where
  map = mapImpl

instance applyRV :: Apply RV where
  apply = applyImpl

instance applicativeRV :: Applicative RV where
  pure = constant

instance bindRV :: Bind RV where
  bind = bindImpl

foreign import step :: ∀ a. a → Channel a → RV a

foreign import run :: ∀ e a. RV (Eff e a) → Eff e Unit

foreign import inspect :: ∀ e a. RV a → Eff e a
