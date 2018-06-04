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
import Alchemy.FRP.ReactiveValue (RV)
import Alchemy.FRP.Subscription (Subscription)

-- | Represents an (IDL) attribute of a DOM element
-- | https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Content_versus_IDL_attributes
newtype Attr = Attr (Node → Subscription)

foreign import unsafeAttr ::
  ∀ a. String → RV a → Attr

id :: RV String → Attr
id = unsafeAttr "id"

className :: RV String → Attr
className = unsafeAttr "class"

value :: RV String → Attr
value = unsafeAttr "value"

checked :: RV Boolean → Attr
checked = unsafeAttr "checked"

readOnly :: RV Boolean → Attr
readOnly = unsafeAttr "readOnly"

hidden :: RV Boolean → Attr
hidden = unsafeAttr "hidden"

disabled :: RV Boolean → Attr
disabled = unsafeAttr "disabled"

inputType :: RV String → Attr
inputType = unsafeAttr "type"

src :: RV String → Attr
src = unsafeAttr "src"

tabIndex :: RV Int → Attr
tabIndex = unsafeAttr "tapindex"

min :: RV Int → Attr
min = unsafeAttr "min"

max :: RV Int → Attr
max = unsafeAttr "max"

step :: RV Int → Attr
step = unsafeAttr "step"
