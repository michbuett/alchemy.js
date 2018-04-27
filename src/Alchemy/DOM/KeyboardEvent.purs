module Alchemy.DOM.KeyboardEvent
 ( KeyEvent
 , keydown
 , keyup
 , KeyboardST
 , pressed
 , keyboard
 ) where

import Alchemy.FRP.Channel (Channel, channel)
import Control.Monad.Eff (Eff)
import Prelude (bind)

type KeyEvent =
  { code :: String
  , ctrlKey :: Boolean
  , shiftKey :: Boolean
  , altKey :: Boolean
  , metaKey :: Boolean
  }

foreign import keydownFn :: forall a eff
  . Channel a
  → String
  → Eff eff (Channel KeyEvent)

keyup :: forall eff.
  Eff eff (Channel KeyEvent)
keyup = do
  c <- channel
  keydownFn c "keyup"

keydown :: forall eff.
  Eff eff (Channel KeyEvent)
keydown = do
  c <- channel
  keydownFn c "keydown"

------------------------------------------------------------

foreign import data KeyboardST :: Type

foreign import pressed :: String → KeyboardST → Boolean

foreign import keyboard :: ∀ eff. Eff eff KeyboardST
