module Alchemy.DOM.Events
  ( Handler
  , unsafeHandler
  ) where

import Effect (Effect)
import Data.Unit (Unit)
import Alchemy.DOM (Node)
import Alchemy.FRP.Subscription (Subscription)

newtype Handler = Handler (Node → Subscription)

foreign import unsafeHandler ::
  ∀ event. String → (event → Effect Unit) → Handler
