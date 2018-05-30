module Alchemy.FRP.Subscription
  ( Subscription
  , together
  ) where

import Alchemy.FRP.Channel (Channel)
import Control.Monad.Eff (Eff)
import Prelude (Unit)

type Subscription = ∀ e1 e2. Eff e1 (Eff e2 Unit)

foreign import together ::
  Array Subscription → Subscription

foreign import switcher ::
  ∀ a. (a → Subscription) → Channel a → Subscription
