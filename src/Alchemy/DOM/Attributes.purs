module Alchemy.DOM.Attributes
  ( Attr
  , id
  , className
  , value
  , checked
  , readOnly
  , hidden
  , disabled
  , inputType
  , src
  , tabIndex
  , min
  , max
  , step
  ) where

import Alchemy.DOM (Node)
import Alchemy.FRP.Event (Event)
import Alchemy.FRP.Subscription (Subscription)

-- | Represents an (IDL) attribute of a DOM element
-- | https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Content_versus_IDL_attributes
newtype Attr = Attr (Node → Subscription)

foreign import unsafeAttr ::
  ∀ a. String → Event a → Attr

id :: Event String → Attr
id = unsafeAttr "id"

className :: Event String → Attr
className = unsafeAttr "class"

value :: Event String → Attr
value = unsafeAttr "value"

checked :: Event Boolean → Attr
checked = unsafeAttr "checked"

readOnly :: Event Boolean → Attr
readOnly = unsafeAttr "readOnly"

hidden :: Event Boolean → Attr
hidden = unsafeAttr "hidden"

disabled :: Event Boolean → Attr
disabled = unsafeAttr "disabled"

inputType :: Event String → Attr
inputType = unsafeAttr "type"

src :: Event String → Attr
src = unsafeAttr "src"

tabIndex :: Event Int → Attr
tabIndex = unsafeAttr "tapindex"

min :: Event Int → Attr
min = unsafeAttr "min"

max :: Event Int → Attr
max = unsafeAttr "max"

step :: Event Int → Attr
step = unsafeAttr "step"
