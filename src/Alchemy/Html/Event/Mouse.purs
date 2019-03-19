module Alchemy.Html.Event.Mouse
  ( MouseEvent
  , onClick
  , onDblclick
  , onMouseup
  , onMousedown
  , readMouseEvent
  ) where

import Prelude

import Alchemy.DOM.Internal.Foreign (ForeignReader, read)
import Alchemy.Html (Attribute, on')
import Effect (Effect)

-- | The MouseEvent interface represents events that occur due to the user
-- | interacting with a pointing device (such as a mouse). Common events using
-- | this interface include click, dblclick, mouseup, mousedown.
-- | (see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent)
-- |
-- | - ´altKey´ Returns true if the alt key was down when the mouse event was
-- |  fired.
-- | - ´button The button number that was pressed (if applicable) when the mouse
-- |  event was fired.
-- | - ´buttons´ The buttons being depressed (if any) when the mouse event was
-- |  fired.
-- | - ´clientX´ The X coordinate of the mouse pointer in local (DOM content)
-- |  coordinates.
-- | - ´clientY´ The Y coordinate of the mouse pointer in local (DOM content)
-- |  coordinates.
-- | - ´ctrlKey´ Returns true if the control key was down when the mouse event
-- |  was fired.
-- | - ´metaKey´ Returns true if the meta key was down when the mouse event was
-- |  fired.
-- | - ´movementX´ The X coordinate of the mouse pointer relative to the
-- |  position of the last mousemove event.
-- | - ´movementY´ The Y coordinate of the mouse pointer relative to the
-- |  position of the last mousemove event.
-- | - ´offsetX´ The X coordinate of the mouse pointer relative to the position
-- |  of the padding edge of the target node.
-- | - ´offsetY´ The Y coordinate of the mouse pointer relative to the position
-- |  of the padding edge of the target node.
-- | - ´pageX´ The X coordinate of the mouse pointer relative to the whole
-- |  document.
-- | - ´pageY´ The Y coordinate of the mouse pointer relative to the whole
-- |  document.
-- | - ´screenX´ The X coordinate of the mouse pointer in global (screen)
-- |  coordinates.
-- | - ´screenY´ The Y coordinate of the mouse pointer in global (screen)
-- |  coordinates.
-- | - ´shiftKey´ Returns true if the shift key was down when the mouse event
-- |  was fired.
-- | - ´which  The button being pressed when the mouse event was fired.
type MouseEvent =
  { altKey :: Boolean
  , button :: Int
  , clientX :: Int
  , clientY :: Int
  , ctrlKey :: Int
  , metaKey :: Boolean
  , movementX :: Int
  , movementY :: Int
  , offsetX :: Int
  , offsetY :: Int
  , pageX :: Int
  , pageY :: Int
  , screenX :: Int
  , screenY :: Int
  , shiftKey :: Boolean
  }


onClick :: ∀ a. Effect Unit → Attribute a
onClick = on' "click"


onDblclick :: ∀ a. Effect Unit → Attribute a
onDblclick = on' "dblclick"


onMousedown :: ∀ a. Effect Unit → Attribute a
onMousedown = on' "mousedown"


onMouseup :: ∀ a. Effect Unit → Attribute a
onMouseup = on' "mouseup"

readMouseEvent :: ForeignReader MouseEvent
readMouseEvent = read
