module Alchemy.FRP.TimeFunction
  ( TF
  , fromVal
  , fromEff
  , fromChannel
  , sample
  , sampleBy
  , combine
  , inspect
  , switcher
  ) where

import Prelude

import Alchemy.FRP.Channel (Channel, subscribe, last)
import Control.Monad.Eff (Eff)
import Unsafe.Coerce (unsafeCoerce)

-- | `TF a` (time function) represents a values of type `a` which varies
-- | (continously) over time. Since there is a potential continous change of
-- | values time functions are evaluated of demand (Pull-FRP)
foreign import data TF :: Type → Type

foreign import fromVal :: ∀ a. a → TF a

foreign import fromChannel :: ∀ a. Channel a → a → TF a

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
  pure = fromVal


sample ::
  ∀ a e1 e2 e3 r. Channel a → TF (Eff e1 r) → Eff e2 (Eff e3 Unit)
sample c s =
  subscribe handler c
  where handler _ = do
          eff <- inspect s
          eff


sampleBy ::
  ∀ a e1 e2 e3 r. Channel a → TF (a → Eff e1 r) → Eff e2 (Eff e3 Unit)
sampleBy c s =
  subscribe handler c
  where handler val = do
          fn <- inspect s
          fn val

-- | Allows to combine values from two TF using a merge function
combine ::
  ∀ a b c. (a → b → c) → TF a → TF b → TF c
combine fn sa sb = fromEff $ do
  a <- inspect sa
  b <- inspect sb
  pure (fn a b)

inspect :: ∀ a eff. TF a → Eff eff a
inspect = unsafeCoerce


------------------------------------------------------------
------------------------------------------------------------

type Consumer = ∀ e1 e2. Eff e1 (Eff e2 Unit)

sample3 :: ∀ a e. TF (a → Eff e Unit) → Channel a → Consumer
sample3 tf ch = subscribe handler ch
  where handler val = do
          fn <- inspect tf
          fn val

switcher :: ∀ a. TF a → Channel (TF a) → TF a
switcher tf = last tf

-- stepper :: ∀ a. a → Channel a → TF a
-- stepper a0 e = switcher (pure a0) (pure <$> e)
