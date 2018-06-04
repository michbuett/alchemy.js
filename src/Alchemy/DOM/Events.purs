module Alchemy.DOM.Events
  ( Handler
  , unsafeHandler
  ) where

import Alchemy.DOM (Node)
import Alchemy.FRP.Subscription (Subscription)
import Control.Monad.Eff (Eff)
import Prelude (Unit)

newtype Handler = Handler (Node → Subscription)

foreign import unsafeHandler ::
  ∀ event e. String → (event → Eff e Unit) → Handler
