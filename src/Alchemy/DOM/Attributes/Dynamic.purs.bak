module Alchemy.DOM.Attributes.Dynamic
  ( className
  , value
  , checked
  , readOnly
  , hidden
  , disabled
  , src
  , tabIndex
  , min
  , max
  , step
  , placeholder
  ) where

import Prelude

import Alchemy.DOM.Internals.Types (Attr(..))
import Alchemy.DOM.Internals.Unsafe (unsafeSetAttr)
import Alchemy.Data.Observable (OV, sample, values)
import Alchemy.FRP.Event (subscribe)

dynamicAttr :: ∀ a. String → OV a → Attr
dynamicAttr name ov =
  Attr \n -> do
    val <- sample ov
    _ <- unsafeSetAttr name n val
    subscribe (values ov) (unsafeSetAttr name n)

className :: OV String → Attr
className = dynamicAttr "class"

value :: OV String → Attr
value = dynamicAttr "value"

checked :: OV Boolean → Attr
checked = dynamicAttr "checked"

readOnly :: OV Boolean → Attr
readOnly = dynamicAttr "readOnly"

hidden :: OV Boolean → Attr
hidden = dynamicAttr "hidden"

disabled :: OV Boolean → Attr
disabled = dynamicAttr "disabled"

src :: OV String → Attr
src = dynamicAttr "src"

placeholder :: OV String → Attr
placeholder = dynamicAttr "placeholder"

tabIndex :: OV Int → Attr
tabIndex = dynamicAttr "tapindex"

min :: OV Int → Attr
min = dynamicAttr "min"

max :: OV Int → Attr
max = dynamicAttr "max"

step :: OV Int → Attr
step = dynamicAttr "step"
