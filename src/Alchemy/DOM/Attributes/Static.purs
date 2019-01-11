module Alchemy.DOM.Attributes.Static
  ( id
  , className
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
  , for
  , attr
  ) where

import Prelude

import Alchemy.DOM.Internals.Types (Attr(..))
import Alchemy.DOM.Internals.Unsafe (unsafeSetAttr)

attr :: ∀ a. String → a → Attr
attr name val =
  Attr \n -> do
    _ <- unsafeSetAttr name n val
    pure (pure unit)


id :: String → Attr
id = attr "id"

className :: String → Attr
className = attr "class"

value :: String → Attr
value = attr "value"

checked :: Boolean → Attr
checked = attr "checked"

readOnly :: Boolean → Attr
readOnly = attr "readOnly"

hidden :: Boolean → Attr
hidden = attr "hidden"

disabled :: Boolean → Attr
disabled = attr "disabled"

src :: String → Attr
src = attr "src"

for :: String → Attr
for = attr "for"

placeholder :: String → Attr
placeholder = attr "placeholder"

tabIndex :: Int → Attr
tabIndex = attr "tapindex"

min :: Int → Attr
min = attr "min"

max :: Int → Attr
max = attr "max"

step :: Int → Attr
step = attr "step"
