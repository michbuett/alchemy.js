module Alchemy.DOM.Internals.Unsafe
  where

import Alchemy.DOM.Internals.Types (Attr, Node)
import Data.Maybe (Maybe(..))
import Effect (Effect)
import Prelude (Unit)

foreign import unsafeSetAttr ::
  ∀ a. String -> Node -> a -> (Effect Unit)

foreign import unsafeSetObjectProperty ::
  ∀ obj a. String -> obj -> a -> (Effect Unit)

foreign import createTextNode :: String -> Effect Node

foreign import createElement :: String -> Effect Node

foreign import appendChild :: Node -> Node -> Effect Unit

foreign import removeChild :: Node -> Node -> Effect Unit

foreign import unsafeHandler ::
  ∀ event. String → (event → Effect Unit) → Attr

foreign import querySelectorImpl ::
  ∀ a. Maybe a -> (a -> Maybe a) -> String -> Effect (Maybe (Node))

querySelector :: String -> Effect (Maybe Node)
querySelector = querySelectorImpl Nothing Just
