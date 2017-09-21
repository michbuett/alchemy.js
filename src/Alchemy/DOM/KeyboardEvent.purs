module Alchemy.DOM.KeyboardEvent
 ( keypressed
 ) where

import Control.Monad.Eff (Eff)
import DOM (DOM)
import DOM.Event.Types (KeyboardEvent)
import Signal (Signal, constant)

foreign import keypressedP :: forall a c e
   . (c -> Signal c)
  -> (Array KeyboardEvent -> a)
  -> Eff (dom :: DOM | e) (Signal a)

keypressed :: forall a e
   . (Array KeyboardEvent -> a)
  -> Eff (dom :: DOM | e) (Signal a)
keypressed = keypressedP constant
