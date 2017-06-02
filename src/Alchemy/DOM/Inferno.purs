module Alchemy.DOM.Inferno
  ( Attribute
  , VNode
  , div
  , text
  , render
  ) where

import Prelude (Unit)
import Control.Monad.Eff (Eff)
import DOM (DOM)

data Attribute = Id

foreign import data VNode :: Type

foreign import div :: (Array Attribute) -> (Array VNode) -> VNode

foreign import text :: String -> VNode

foreign import render :: forall e. String -> VNode -> Eff (dom :: DOM | e) Unit
