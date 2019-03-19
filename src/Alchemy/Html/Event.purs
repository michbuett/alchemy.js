module Alchemy.Html.Event
  ( onChange
  , onCheck
  , onInput
  , onFocus
  , onBlur
  , readValue
  , readChecked
  , module Keyboard
  , module Mouse
  ) where


import Prelude

import Effect (Effect)

import Alchemy.DOM.Internal.Foreign (F, ForeignReader, read)
import Alchemy.Html (Attribute, on, on')
import Alchemy.Html.Event.Keyboard (KeyboardST, keyboard, onKeyChange, onKeydown, pressed) as Keyboard
import Alchemy.Html.Event.Mouse (MouseEvent, onClick, onDblclick, onMousedown, onMouseup, readMouseEvent) as Mouse



onChange :: ∀ a. (String -> Effect Unit) -> Attribute a
onChange = on "change" readValue


onInput :: ∀ a. (String -> Effect Unit) -> Attribute a
onInput = on "input" readValue


onCheck :: ∀ a. (String -> Effect Unit) -> Attribute a
onCheck = on "change" readValue


onFocus :: ∀ a. Effect Unit -> Attribute a
onFocus = on' "focus"


onBlur :: ∀ a. Effect Unit -> Attribute a
onBlur = on' "blur"


readValue :: ForeignReader String
readValue e =
  let parsed :: F { target :: { value :: String }}
      parsed = read e
   in _.target.value <$> parsed


readChecked :: ForeignReader Boolean
readChecked e =
  let parsed :: F { target :: { checked :: Boolean }}
      parsed = read e
   in _.target.checked <$> parsed
