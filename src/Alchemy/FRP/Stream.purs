module Alchemy.FRP.Stream
  ( Stream
  , fromVal
  , fromEff
  , fromChannel
  , sample
  , sampleBy
  , combine
  , inspect
  ) where

import Prelude
import Control.Monad.Eff (Eff)
import Unsafe.Coerce (unsafeCoerce)
import Alchemy.FRP.Channel (Channel, FRP)

-- | A `Stream a` represents a values of type `a` which varies over time
foreign import data Stream :: Type → Type

foreign import fromVal :: ∀ a. a → Stream a

foreign import fromChannel :: ∀ a. Channel a → a → Stream a

fromEff :: ∀ eff a. Eff eff a → Stream a
fromEff = unsafeCoerce

foreign import mapImpl :: forall a b.
  (a -> b) -> Stream a -> Stream b

instance functorStream :: Functor Stream where
  map = mapImpl

foreign import applyImpl ::
  ∀ a b. Stream (a → b) → Stream a → Stream b

instance applyStream :: Apply Stream where
  apply = applyImpl

instance applicativeStream :: Applicative Stream where
  pure = fromVal

foreign import sample ::
  ∀ a eff r
  . Channel a
  → Stream (Eff eff r)
  → Eff (frp :: FRP | eff) Unit

foreign import sampleBy ::
  ∀ a eff r
  . Channel a
  → Stream (a → Eff eff r)
  → Eff (frp :: FRP | eff) Unit

foreign import combine ::
  ∀ a b c . (a → b → c) → Stream a → Stream b → Stream c

inspect :: ∀ a eff. Stream a → Eff eff a
inspect = unsafeCoerce
