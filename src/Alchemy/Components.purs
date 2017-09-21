module Alchemy.Components
  ( Components
  , init
  , insert
  ) where

import Prelude
import Control.Monad.Eff (Eff)
import Signal (Signal)

foreign import data Components :: Type → Type → Type

foreign import mapP :: ∀ k a b. (a → b) → Components k a → Components k b

instance functorCmp :: Functor (Components k) where
  map = mapP

foreign import init :: ∀ v
  . String
  → v
  → Components String (Signal v)

foreign import insert :: ∀ v
  . String
  → v
  → Components String (Signal v)
  → Components String (Signal v)

foreign import unwrap :: ∀ e v
  . Components String (Eff (e) v)
  → Eff (e) (Components String v)
