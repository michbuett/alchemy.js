module Alchemy.DOM.KeyboardEvent
 ( KeyboardST
 , pressed
 , keyboard
 ) where

import Control.Monad.Eff (Eff)

foreign import data KeyboardST :: Type

foreign import pressed :: String → KeyboardST → Boolean

foreign import keyboard :: ∀ eff. Eff eff KeyboardST
