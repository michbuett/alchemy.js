module Alchemy.DOM.Internals.Types
  ( Node
  , DOM(..)
  , Attr(..)
  ) where

import Alchemy.FRP.Subscription (Subscription)

foreign import data Node :: Type

-- | Represents an (IDL) attribute of a DOM element
-- | https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Content_versus_IDL_attributes
newtype Attr = Attr (Node → Subscription)

newtype DOM = DOM (Node → Subscription)

