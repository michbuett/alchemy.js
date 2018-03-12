module Alchemy.FRP.Stream
  ( Stream
  , fromVal
  , fromEff
  , fromChannel
  , sample
  , sampleBy
  , combine
  -- , prod
  -- , foldlS
  -- , foldrS
  ) where

import Prelude
import Control.Monad.Eff (Eff, kind Effect)
-- import Data.Tuple (Tuple(..))
import Alchemy.FRP.Channel (Channel, FRP)

-- | A `Stream a` represents a set of 0 or more values of type `a`
-- | which vary over time
foreign import data Stream :: Type → Type

foreign import fromVal :: ∀ a.
  a → Stream a

foreign import fromEff :: ∀ eff a.
  Eff eff a → Stream a

foreign import fromChannel :: ∀ a.
  Channel a → a → Stream a

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

-- prod :: ∀ a b
--   . Stream (Array a)
--   → Stream (Array b)
--   → Stream (Array (Tuple a b))
-- prod =
--   combine (\x y -> Tuple x y)

-- foreign import foldrS ::
--   ∀ a b. (a → b → b) → b → Stream a → Stream b
--
-- foreign import foldlS ::
--   ∀ a b. (b → a → b) → b → Stream a → Stream b