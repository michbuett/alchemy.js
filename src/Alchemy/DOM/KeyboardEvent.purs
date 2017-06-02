module Alchemy.DOM.KeyboardEvent
 ( KeyboardEvent
 , Key
 , key
 , onKeypressed
 , isPressed
 ) where

import Control.Monad.Eff (Eff)
import DOM (DOM)
import Signal (Signal, constant)
import Data.Array (elem)
import Data.Eq (class Eq, (==))

newtype Key = Key String

instance eqKey :: Eq Key where
  eq (Key k1) (Key k2) = k1 == k2

foreign import key :: String -> Key

type KeyboardEvent =
  { pressed :: Array Key
  , ctrlKey :: Boolean
  , shiftKey :: Boolean
  , altKey :: Boolean
  , metaKey :: Boolean
  }


foreign import keyPressedP ::
  forall e c. (c -> Signal c) -> Eff (dom :: DOM | e) (Signal KeyboardEvent)

-- |Creates a signal which will be `true` when the key matching the given key
-- |code is pressed, and `false` when it's released.
onKeypressed :: forall e. Eff (dom :: DOM | e) (Signal KeyboardEvent)
onKeypressed = keyPressedP constant

isPressed :: KeyboardEvent -> Key -> Boolean
isPressed e k = elem k e.pressed
