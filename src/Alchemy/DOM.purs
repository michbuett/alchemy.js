module Alchemy.DOM
  ( DOM
  , Node
  , render
  ) where

import Alchemy.FRP.Subscription (Subscription)

foreign import data Node :: Type

newtype DOM = DOM (Node → Subscription)

foreign import render ::
  String → DOM → Subscription
