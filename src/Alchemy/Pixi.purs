module Alchemy.Pixi
  ( Pixi
  , PIXI
  , pixi
  ) where

import Control.Monad.Eff (Eff, kind Effect)
import DOM (DOM)
import DOM.Node.Types (Node)

foreign import data Pixi :: Type

foreign import data PIXI :: Effect

foreign import pixi :: Eff (pixi :: PIXI) Pixi

foreign import body :: ∀ e. Eff (dom :: DOM | e) Node
