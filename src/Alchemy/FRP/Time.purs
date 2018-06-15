module Alchemy.FRP.Time
  ( tick
  ) where

import Effect (Effect)
import Alchemy.FRP.Event (Event, Channel, openChannel)

foreign import tickImpl :: ∀ a e
  . Effect (Channel a a)
  → Effect (Event Number)

tick :: ∀ e. Effect (Event Number)
tick = tickImpl openChannel
