module Alchemy.DOM
  ( render
  ) where

import Alchemy.DOM.Internals.Types (DOM(..))
import Alchemy.FRP.Subscription (Subscription)

foreign import render ::
  String → DOM → Subscription

