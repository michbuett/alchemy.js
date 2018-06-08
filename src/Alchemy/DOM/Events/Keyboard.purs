module Alchemy.DOM.Events.Keyboard
 ( KeyboardST
 , pressed
 , keyboard
 , onKeyChange
 ) where

import Alchemy.FRP.Event (Channel, Event, openChannel)
import Control.Monad.Eff (Eff)

foreign import data KeyboardST :: Type

foreign import pressed :: String → KeyboardST → Boolean

foreign import keyboard :: ∀ eff. Eff eff KeyboardST

foreign import onKeyChangeImpl ::
  ∀ e1 e2 a b
  . Eff e1 (Channel a b)
 -> Eff e2 (Event KeyboardST)

onKeyChange :: ∀ e. Eff e (Event KeyboardST)
onKeyChange =
  onKeyChangeImpl openChannel
