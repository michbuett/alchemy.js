module Alchemy.FRP.Behavior
  ( Behavior
  , fromEff
  , sample
  , sampleBy
  , sampleNow
  , map2
  , map3
  ) where

import Prelude

import Alchemy.FRP.Event (Event, shareWhen)
import Effect (Effect)

-- | `Behavior a` (time function) represents a values of type `a` which varies
-- | (continously) over time. Since there is a potential continous change of
-- | values time functions are evaluated on demand (Pull-FRP)
newtype Behavior a = Behavior (Effect a)

derive instance functorBehavior :: Functor Behavior

fromEff :: ∀ a. Effect a → Behavior a
fromEff = Behavior

instance applyBehavior :: Apply Behavior where
  apply (Behavior f) (Behavior a) = Behavior (f <*> a)

instance applicativeBehavior :: Applicative Behavior where
  pure x = Behavior (pure x)

instance semigroupBehavior :: Semigroup a => Semigroup (Behavior a) where
  append (Behavior a) (Behavior b) = Behavior (a <> b)

instance bindBehavior :: Bind Behavior where
  bind (Behavior b) f = Behavior (b >>= f >>> sampleNow)

instance monadBehavior :: Monad Behavior

instance monoidBehavior :: Monoid a => Monoid (Behavior a) where
  mempty = Behavior mempty


sample :: ∀ a b. Behavior b -> Event a → Event b
sample b e = shareWhen smpl e
  where
    smpl send _ = sampleNow b >>= send


sampleBy :: ∀ a b. Behavior (a -> b) -> Event a → Event b
sampleBy b e = shareWhen smpl e
  where
    smpl send a = do
       f <- sampleNow b
       send (f a)


-- | Returns the current value the time function has "now"
sampleNow :: ∀ a. Behavior a → Effect a
sampleNow (Behavior eff) = eff

-- | Allows to combine values from two Behavior using a merge function
map2 ::
  ∀ a b c. (a → b → c) → Behavior a → Behavior b → Behavior c
map2 f a b = f <$> a <*> b

-- | Allows to combine values from three Behaviors using a merge function
map3 ::
  ∀ a b c d. (a → b → c → d) → Behavior a → Behavior b → Behavior c → Behavior d
map3 f a b c = f <$> a <*> b <*> c
