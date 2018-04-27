module Alchemy.FRP.Time
  ( tick
  ) where

import Control.Monad.Eff (Eff)
import Alchemy.FRP.Channel (Channel, channel)

foreign import tickImpl :: ∀ a e
  . Eff e (Channel a)
  → Eff e (Channel Number)

tick :: ∀ e. Eff e (Channel Number)
tick = tickImpl channel
