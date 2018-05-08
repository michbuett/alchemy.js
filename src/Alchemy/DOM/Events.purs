module Alchemy.DOM.Events
  ( Handler
  , unsafeHandler
  ) where

import Alchemy.DOM (Node)
import Control.Monad.Eff (Eff)
import Prelude (Unit)

newtype Handler = Handler
  (∀ e1 e2. Node → Eff e1 (Eff e2 Unit))

foreign import unsafeHandler ::
  ∀ event e. String → (event → Eff e Unit) → Handler
