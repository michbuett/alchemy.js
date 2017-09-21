module Alchemy.Pixi.Stage
  ( Stage
  , stage
  , render
  ) where

import Prelude (Unit)
import Control.Monad.Eff (Eff)
import DOM (DOM)
import Alchemy.Pixi.Renderer (Renderer)

foreign import data Stage :: Type

foreign import stage :: Stage

foreign import render :: ∀ e. Renderer → Stage → Eff (dom :: DOM | e) Unit
