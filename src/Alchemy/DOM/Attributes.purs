module Alchemy.DOM.Attributes
  ( Attr
  , class AttrValue
  , defineAttr
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
import Alchemy.FRP.Stream (Stream)
import Control.Monad.Eff (Eff)
import Prelude (Unit)

newtype Attr =
  Attr (Node → Eff () (Array (Eff () Unit)))

-- | https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes#Content_versus_IDL_attributes
class AttrValue a where
  defineAttr :: String → a → Attr

instance attrValueBoolean :: AttrValue Boolean where
  defineAttr = staticAttr

instance attrValueInt :: AttrValue Int where
  defineAttr = staticAttr

instance attrValueNumber :: AttrValue Number where
  defineAttr = staticAttr

instance attrValueString :: AttrValue String where
  defineAttr = staticAttr

instance attValueStreamBoolean :: AttrValue (Stream Boolean) where
  defineAttr = dynamicAttr

instance attValueStreamInt :: AttrValue (Stream Int) where
  defineAttr = dynamicAttr

instance attValueStreamNumber :: AttrValue (Stream Number) where
  defineAttr = dynamicAttr

instance attValueStreamString :: AttrValue (Stream String) where
  defineAttr = dynamicAttr

foreign import staticAttr :: ∀ a. String → a → Attr
foreign import dynamicAttr :: ∀ a. String → Stream a → Attr

id :: ∀ a. AttrValue a ⇒ a → Attr
id = defineAttr "id"

className :: ∀ a. AttrValue a ⇒ a → Attr
className = defineAttr "class"

value :: ∀ a. AttrValue a ⇒ a → Attr
value = defineAttr "value"

checked :: ∀ a. AttrValue a ⇒ a → Attr
checked = defineAttr "checked"

readOnly :: ∀ a. AttrValue a ⇒ a → Attr
readOnly = defineAttr "readOnly"

hidden :: ∀ a. AttrValue a ⇒ a → Attr
hidden = defineAttr "hidden"

disabled :: ∀ a. AttrValue a ⇒ a → Attr
disabled = defineAttr "disabled"

inputType :: ∀ a. AttrValue a ⇒ a → Attr
inputType = defineAttr "type"

src :: ∀ a. AttrValue a ⇒ a → Attr
src = defineAttr "src"

tabIndex :: ∀ a. AttrValue a ⇒ a → Attr
tabIndex = defineAttr "tapindex"

min :: ∀ a. AttrValue a ⇒ a → Attr
min = defineAttr "min"

max :: ∀ a. AttrValue a ⇒ a → Attr
max = defineAttr "max"

step :: ∀ a. AttrValue a ⇒ a → Attr
step = defineAttr "step"
