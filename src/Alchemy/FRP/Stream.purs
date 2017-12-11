module Alchemy.FRP.Stream
  ( Stream
  , fromVal
  , fromCallback
  , fromEff
  , fromChannel
  , sample
  , sampleBy
  , combine
  , prod
  , foldlS
  , foldrS
  , collapse
  ) where

import Prelude
import Control.Monad.Eff (Eff, kind Effect)
import Data.Tuple (Tuple(..))
import Alchemy.FRP.Channel (Channel, FRP)

-- | A `Stream a` represents a set of 0 or more values of type `a`
-- | which vary over time
foreign import data Stream :: Type → Type

foreign import fromVal :: ∀ a.
  a → Stream a

foreign import fromCallback :: ∀ a b c.
  ((a → b) → c) → Stream a

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
  . Stream (Eff eff r)
  → Channel a
  → Eff (frp :: FRP | eff) Unit

foreign import sampleBy ::
  ∀ a eff r
  . Stream (a → Eff eff r)
  → Channel a
  → Eff (frp :: FRP | eff) Unit

foreign import combine ::
  ∀ a b c . (a → b → c) → Stream a → Stream b → Stream c

prod ::
  ∀ a b . Stream a → Stream b → Stream (Tuple a b)
prod =
  combine (\x y -> Tuple x y)

foreign import foldrS ::
  ∀ a b. (a → b → b) → b → Stream a → Stream b

foreign import foldlS ::
  ∀ a b. (b → a → b) → b → Stream a → Stream b

foreign import collapse ::
  ∀ a. Stream a → Stream (Array a)

