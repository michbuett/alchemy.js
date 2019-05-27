module Gfx2d.Foreign.Sprite
  where

import Prelude

import Alchemy.DOM.Internal.Foreign (unsafeSetObjectProperty)
import Gfx2d.Foreign.Renderer (Graphic(..), RenderContext)
import Data.Traversable (traverse, traverse_)
import Effect (Effect)

newtype Asset a = Asset a

newtype Image = Image String

image :: String -> Asset Image
image = Asset <<< Image

newtype Attribute a b =
  Attribute (a -> Effect (b -> Effect Unit))

type SpriteData =
  { xpos :: Number
  , ypos :: Number
  , width :: Number
  , height :: Number
  , texture :: Asset Image
  }


xpos :: ∀ r. Attribute { xpos :: Number | r } Number
xpos = Attribute \obj ->
  pure \x -> unsafeSetObjectProperty "xpos" obj x


ypos :: ∀ r. Attribute { ypos :: Number | r } Number
ypos = Attribute \obj ->
  pure \x -> unsafeSetObjectProperty "ypos" obj x

cmap :: ∀ a b c. (c -> b) -> Attribute a b -> Attribute a c
cmap f (Attribute attr) = Attribute \o -> do
  update <- attr o
  pure (f >>> update)

foreign import spriteRenderImpl ::
  SpriteData
    -> RenderContext
    -> Effect { sprite :: SpriteData, remove :: Effect Unit }


sprite :: ∀ a. SpriteData -> Array (Attribute SpriteData a) -> Graphic a
sprite sdata as = Graphic \ctxt -> do
  { sprite: s, remove } <- spriteRenderImpl sdata ctxt
  updates <- traverse (\(Attribute a) -> a s) as
  pure
    { update: \a -> traverse_ (\f -> f a) updates
    , remove
    }

list :: ∀ a. Array (Graphic a) -> Graphic a
list gs = Graphic \ctxt -> do
  ur <- traverse (\(Graphic g) -> g ctxt) gs
  pure
    { update: \a -> do
        traverse_ (\{ update } -> update a) ur

    , remove: traverse_ _.remove ur
    }
