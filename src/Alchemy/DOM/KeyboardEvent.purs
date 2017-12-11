module Alchemy.DOM.KeyboardEvent
 ( KeyEvent
 , keydown
 , keyup
 ) where

import Prelude (bind)
import Control.Monad.Eff (Eff)
import DOM (DOM)
import Alchemy.FRP.Channel (FRP, Channel, channel)

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
