module Alchemy.FRP.ReactiveValue
  ( RV
  , stepRV
  , constantRV
  , createRV
  , inspectRV
  , sinkRV
  ) where

import Prelude

import Alchemy.FRP.Channel (Channel)
import Alchemy.FRP.Subscription (Subscription)
import Control.Monad.Eff (Eff)
import Data.Function.Uncurried (Fn2, runFn2)

foreign import data RV :: Type → Type

foreign import mapImpl ::
  ∀ a b.  Fn2 (a → b) (RV a) (RV b)

instance mapRV :: Functor RV where
  map = runFn2 mapImpl

foreign import applyImpl ::
  ∀ a b.  Fn2 (RV (a → b)) (RV a) (RV b)

instance applyRV :: Apply RV where
  apply = runFn2 applyImpl

foreign import constantRV ::
  ∀ a. a → RV a

instance applicativeRV :: Applicative RV where
  pure = constantRV

foreign import bindImpl
  :: ∀ a b.  Fn2 (RV a) (a → RV b) (RV b)

instance bindRV :: Bind RV where
  bind = runFn2 bindImpl

foreign import stepRV ::
  ∀ a. a → Channel a → RV a

foreign import createRV ::
  ∀ a e. a → Eff e { rv :: RV a, setValue :: a → Eff e Unit }

foreign import inspectRV ::
  ∀ e a. RV a → Eff e a

foreign import sinkRV ::
  ∀ e a. RV (Eff e a) → Subscription
