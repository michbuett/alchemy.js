module Alchemy.DOM.KeyboardEvent
 ( KeyEvent
 , keydown
 , keyup
 , KeyboardST
 , pressed
 , keyboard
 ) where

import Alchemy.FRP.Channel (FRP, Channel, channel)
import Control.Monad.Eff (Eff)
import DOM (DOM)
import Prelude (bind)

type KeyEvent =
  { code :: String
  , ctrlKey :: Boolean
  , shiftKey :: Boolean
  , altKey :: Boolean
  , metaKey :: Boolean
  }

foreign import keydownFn :: forall a e
  . Channel a
  → String
  → Eff (dom :: DOM | e) (Channel KeyEvent)

keyup :: forall e.
  Eff (frp :: FRP, dom :: DOM | e) (Channel KeyEvent)
keyup = do
  c <- channel
  keydownFn c "keyup"

keydown :: forall e.
  Eff (frp :: FRP, dom :: DOM | e) (Channel KeyEvent)
keydown = do
  c <- channel
  keydownFn c "keydown"

------------------------------------------------------------

foreign import data KeyboardST :: Type

foreign import pressed :: String → KeyboardST → Boolean

foreign import keyboard :: ∀ e. Eff (dom :: DOM | e) KeyboardST
