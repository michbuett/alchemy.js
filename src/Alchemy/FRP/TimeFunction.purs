module Alchemy.FRP.TimeFunction
  ( TF
  , constantTF
  , fromEff
  , stepTF
  , createTF
  , sample
  , sampleBy
  , map2
  , inspectTF
  ) where

import Prelude

import Alchemy.FRP.Channel (Channel, subscribe)
import Alchemy.FRP.ReactiveValue (RV, inspectRV)
import Alchemy.FRP.Subscription (Subscription)
import Control.Monad.Eff (Eff)
import Unsafe.Coerce (unsafeCoerce)

-- | `TF a` (time function) represents a values of type `a` which varies
-- | (continously) over time. Since there is a potential continous change of
-- | values time functions are evaluated of demand (Pull-FRP)
foreign import data TF :: Type → Type

foreign import constantTF ::
  ∀ a. a → TF a

stepTF ::
  ∀ a. RV a → TF a
stepTF rv =
  fromEff $ inspectRV rv

foreign import createTF ::
  ∀ a e. a → Eff e { tf :: TF a, setValue :: a → Eff e Unit }

fromEff :: ∀ eff a. Eff eff a → TF a
fromEff = unsafeCoerce

foreign import mapImpl ::
  ∀ a b. (a -> b) -> TF a -> TF b

instance functorTF :: Functor TF where
  map = mapImpl

foreign import applyImpl ::
  ∀ a b. TF (a → b) → TF a → TF b

instance applyTF :: Apply TF where
  apply = applyImpl

instance applicativeTF :: Applicative TF where
  pure = constantTF


sample ::
  ∀ a e r. Channel a → TF (Eff e r) → Subscription
sample c s =
  subscribe handler c
  where handler _ = do
          eff <- inspectTF s
          eff


sampleBy ::
  ∀ a e r. Channel a → TF (a → Eff e r) → Subscription
sampleBy c s =
  subscribe handler c
  where handler val = do
          fn <- inspectTF s
          fn val


-- | Returns the current value the time function has "now"
inspectTF :: ∀ a eff. TF a → Eff eff a
inspectTF = unsafeCoerce


-- | Allows to combine values from two TF using a merge function
map2 ::
  ∀ a b c. (a → b → c) → TF a → TF b → TF c
map2 f a b = f <$> a <*> b
