module Alchemy.FRP.Subscription
  ( Subscription
  , together
  ) where

import Effect (Effect)
import Data.Unit (Unit)

type Subscription = Effect (Effect Unit)

foreign import together ::
  Array Subscription → Subscription
