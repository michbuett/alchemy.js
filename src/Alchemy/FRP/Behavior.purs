module Alchemy.FRP.Behavior
  ( Behavior
  , fromEff
  , sample
  , sampleBy
  , sampleNow
  , map2
  ) where

import Prelude

import Alchemy.FRP.Event (Event)
import Effect (Effect)
import Unsafe.Coerce (unsafeCoerce)

-- | `Behavior a` (time function) represents a values of type `a` which varies
-- | (continously) over time. Since there is a potential continous change of
-- | values time functions are evaluated of demand (Pull-FRP)
foreign import data Behavior :: Type → Type

foreign import pureImpl ::
  ∀ a. a → Behavior a

fromEff :: ∀ eff a. Effect a → Behavior a
fromEff = unsafeCoerce

foreign import mapImpl ::
  ∀ a b. (a -> b) -> Behavior a -> Behavior b

instance functorTF :: Functor Behavior where
  map = mapImpl

foreign import applyImpl ::
  ∀ a b. Behavior (a → b) → Behavior a → Behavior b

instance applyTF :: Apply Behavior where
  apply = applyImpl

instance applicativeTF :: Applicative Behavior where
  pure = pureImpl


foreign import sample ::
  ∀ a b. Behavior b -> Event a → Event b


foreign import sampleBy ::
  ∀ a b. Behavior (a → b) → Event a → Event b


-- | Returns the current value the time function has "now"
sampleNow :: ∀ a eff. Behavior a → Effect a
sampleNow = unsafeCoerce


-- | Allows to combine values from two Behavior using a merge function
map2 ::
  ∀ a b c. (a → b → c) → Behavior a → Behavior b → Behavior c
map2 f a b = f <$> a <*> b
