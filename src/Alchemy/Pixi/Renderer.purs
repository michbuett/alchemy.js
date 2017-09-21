module Alchemy.Pixi.Renderer
  ( Renderer
  , RendererOptions
  , body
  , rendererDefaults
  ) where

import Control.Monad.Eff (Eff)
import DOM (DOM)
import DOM.Node.Types (Node)

foreign import data Renderer :: Type

type RendererOptions =
  { width :: Int
  , height :: Int
  }

rendererDefaults :: RendererOptions
rendererDefaults =
  { width: 800
  , height: 600
  }

foreign import autoDetectRenderer :: ∀ e. RendererOptions → Node → Eff (dom :: DOM | e) Renderer

foreign import body :: ∀ e. Eff (dom :: DOM | e) Node
