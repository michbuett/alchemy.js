module Alchemy.FRP.Channel
  ( Channel
  , channel
  , subscribe
  , send
  ) where

import Prelude (Unit)
import Control.Monad.Eff (Eff)

foreign import data Channel :: Type → Type

foreign import channel :: ∀ a eff.
  Eff eff (Channel a)

foreign import subscribe ::
  ∀ a e r
  . (a → Eff e r)
  → Channel a
  → Eff e Unit

foreign import send :: ∀ a eff.
  Channel a → a → Eff eff Unit
