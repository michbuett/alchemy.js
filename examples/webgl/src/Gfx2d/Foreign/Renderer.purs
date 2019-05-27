module Gfx2d.Foreign.Renderer
  where

import Prelude

import Alchemy.FRP.Event (Event, subscribe)
import Alchemy.FRP.Subscription (Subscription)
import Effect (Effect)


foreign import data RenderContext :: Type

type RenderConfig =
  { width :: Int
  , height :: Int
  , selector :: String
  }


newtype Graphic a =
  Graphic
  ( RenderContext -> Effect
                       { update :: a -> Effect Unit
                       , remove :: Effect Unit
                       }
  )


foreign import initRendererImpl :: RenderConfig -> Effect RenderContext


foreign import refreshRenderResultImpl :: RenderContext -> Effect Unit


render :: ∀ a. RenderConfig -> Event a -> Graphic a -> Subscription
render cfg ev (Graphic g) = do
  ctxt <- initRendererImpl cfg
  { update, remove } <- g ctxt
  cancel <- subscribe ev update
  pure do
    cancel
    remove
