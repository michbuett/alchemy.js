module Alchemy.FRP.Time
  ( tick
  ) where

import Control.Monad.Eff (Eff)
import Alchemy.FRP.Event (Event, Channel, openChannel)

foreign import tickImpl :: ∀ a e
  . Eff e (Channel a a)
  → Eff e (Event Number)

tick :: ∀ e. Eff e (Event Number)
tick = tickImpl openChannel
