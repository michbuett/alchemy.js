module Alchemy.WebGL.Test
  where

import Effect (Effect)
import Prelude (Unit)

foreign import run :: Effect Unit

foreign import data WebGLContext :: Type

-- foreign import data ImageData :: Type
foreign import data Texture :: Type

-- newtype Texture =
--   Texture
--     { img :: ImageData
--     , width :: Int
--     , height :: Int
--     }

type SpriteData =
  { texture :: Texture
  , offsetX :: Int
  , offsetY :: Int
  , width :: Int
  , height :: Int
  }

newtype Graphic a =
  Graphic (WebGLContext -> Effect
                            { update :: a -> Effect Unit
                            , remove :: Effect Unit
                            })

-- sprite :: ∀ a. SpriteData -> Graphic a
