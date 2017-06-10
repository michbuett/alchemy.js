module Alchemy.DOM.KeyboardEvent
 ( keypressed
 ) where

import Control.Monad.Eff (Eff)
import DOM (DOM)
import DOM.Event.Types (KeyboardEvent)
import Signal (Signal, constant)

foreign import keypressedP :: forall a c e
   . (c -> Signal c)
  -> (Array KeyboardEvent -> Array a)
  -> Eff (dom :: DOM | e) (Signal (Array a))

keypressed :: forall a e
   . (Array KeyboardEvent -> Array a)
  -> Eff (dom :: DOM | e) (Signal (Array a))
keypressed = keypressedP constant
