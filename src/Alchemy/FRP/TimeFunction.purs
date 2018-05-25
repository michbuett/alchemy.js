module Alchemy.FRP.TimeFunction
  ( TF
  , fromVal
  , fromEff
  , fromChannel
  , sample
  , sampleBy
  , combine
  , inspect
  ) where

import Prelude

import Alchemy.FRP.Channel (Channel, subscribe)
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
  ∀ a eff r. Channel a → TF (Eff eff r) → Eff eff Unit
sample c s =
  subscribe handler c
  where handler _ = do
          eff <- inspect s
          eff


sampleBy ::
  ∀ a eff r. Channel a → TF (a → Eff eff r) → Eff eff Unit
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

newtype Sample e = Sample { start :: Eff e Unit, stop :: Eff e Unit }

run :: ∀ switch e
  . Channel switch
  → (switch → Boolean)
  → Sample e
  → Eff e Unit
run c contFn (Sample { start, stop }) =
  subscribe switchContext c
  where switchContext switch =
          if contFn switch
            then start
            else stop


sample2 ::
  ∀ a e r. Channel a → TF (Eff e r) → Sample e
sample2 c s =
  Sample { start: pure unit
         , stop: pure unit
         }
