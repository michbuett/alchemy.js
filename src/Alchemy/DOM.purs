module Alchemy.DOM
 ( KeyEvent
 , keypressed
 ) where

import Control.Monad.Eff (Eff)
import DOM (DOM)
import Signal (Signal, constant)
import DOM.Event.Types (EventType)
import DOM.Node.ParentNode (QuerySelector(..))

type KeyEvent =
  { pressedCodes :: Array String
  , ctrlKey :: Boolean
  , shiftKey :: Boolean
  , altKey :: Boolean
  , metaKey :: Boolean
  }

newtype Foo = Foo String


body :: QuerySelector
body = QuerySelector "body"

foreign import keyPressedP ::
  forall e c. (c -> Signal c) -> Eff (dom :: DOM | e) (Signal KeyEvent)

-- |Creates a signal which will be `true` when the key matching the given key
-- |code is pressed, and `false` when it's released.
keypressed :: forall e. Eff (dom :: DOM | e) (Signal KeyEvent)
keypressed = keyPressedP constant

foreign import fromEventP ::
  forall e c. (c -> Signal c) -> EventType -> String -> Eff (dom :: DOM | e) (Signal KeyEvent)
