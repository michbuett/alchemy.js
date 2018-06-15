module Alchemy.DOM.Events.Keyboard
 ( KeyboardST
 , pressed
 , keyboard
 , onKeyChange
 ) where

import Alchemy.FRP.Event (Channel, Event, openChannel)
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
