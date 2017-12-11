module Alchemy.DOM.Inferno
  ( Attribute
  , VNode
  , VDom
  , render
  -- attributes
  , id
  , className
  -- virtual dom nodes
  , div
  , text
  ) where

import Prelude (Unit)
import Control.Monad.Eff (Eff)
import DOM (DOM)

newtype Attribute = Attribute (Array String)

id :: String → Attribute
id val = Attribute [ "id", val ]

className :: String → Attribute
className val = Attribute [ "className", val ]

foreign import data VNode :: Type

foreign import div :: (Array Attribute) → (Array VNode) → VNode

foreign import text :: String → VNode

type VDom a =
  { vnode :: VNode
  , root :: String
  | a }

foreign import render ::
  ∀ a eff. VDom a → Eff (dom :: DOM | eff) Unit
