module Alchemy.Html.Event.Keyboard
 ( KeyboardST
 , pressed
 , keyboard
 , onKeyChange
 , onKeydown
 ) where

import Prelude

import Alchemy.DOM.Internal.Foreign (ForeignReader, F, read)
import Alchemy.FRP.Event (Channel, Event, openChannel)
import Alchemy.Html (Attribute, on)
import Effect (Effect)

foreign import data KeyboardST :: Type

foreign import pressed :: String → KeyboardST → Boolean

foreign import keyboard :: Effect KeyboardST

foreign import onKeyChangeImpl ::
  ∀ a b
  . Effect (Channel a b)
 -> Effect (Event KeyboardST)

onKeyChange :: Effect (Event KeyboardST)
onKeyChange =
  onKeyChangeImpl openChannel


onKeydown :: ∀ a. (String -> Effect Unit) -> Attribute a
onKeydown = on "keydown" readCode


onKeyup :: ∀ a. (String -> Effect Unit) -> Attribute a
onKeyup = on "keyup" readCode


onKeypressed :: ∀ a. (String -> Effect Unit) -> Attribute a
onKeypressed = on "keypressed" readCode


readCode :: ForeignReader String
readCode obj =
  let r :: F { code :: String }
      r = read obj
   in _.code <$> r
