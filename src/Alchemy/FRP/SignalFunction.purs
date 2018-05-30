module Alchemy.FRP.SignalFunction
  ( SF(..)
  ) where

import Prelude

import Alchemy.FRP.Channel as C
import Alchemy.FRP.Subscription (Subscription)
import Control.Monad.Eff (Eff)

newtype SF a b = SF (a → b)

instance functorSF :: Functor (SF a) where
  map f (SF a2b) = SF (\a -> f $ a2b a)

subscribe ::
  ∀ a e. SF a (Eff e Unit) → C.Channel a → Subscription
subscribe (SF sink) =
  C.subscribe sink
