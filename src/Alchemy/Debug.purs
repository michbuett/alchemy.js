module Alchemy.Debug
  where

import Effect (Effect)
import Prelude (Unit)

foreign import debugLog :: ∀ a.
  String -> a -> Effect Unit
