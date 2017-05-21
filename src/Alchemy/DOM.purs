module Alchemy.DOM
 ( loop
 , drainBuffer
 ) where

import Prelude (Unit)
import Control.Monad.Eff (Eff)
import DOM (DOM)
-- import Control.Monad.Eff.Console (CONSOLE)
import Alchemy.Buffer (Buffer)

foreign import loop ::
  forall e. Eff (e) Unit -> Eff (dom :: DOM | e) Unit
-- foreign import loop ::
--   forall e.
--   (forall eff. Eff ( console ∷ CONSOLE | eff ) Unit)
--   -> Eff (dom :: DOM | e) Unit

foreign import drainBuffer ::
  forall a e
   . (a -> Eff (e) Unit)
  -> Buffer a
  -> Eff (e) Unit
