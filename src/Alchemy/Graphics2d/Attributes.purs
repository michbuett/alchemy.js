module Alchemy.Graphics2d.Attributes
  ( Attr
  , pos
  )
  where

import Alchemy.FRP.Event (Event)
import Alchemy.FRP.Subscription (Subscription)
import Alchemy.Graphics2d (Ressource)

newtype Attr = Attr (Ressource → Subscription)

foreign import pos :: ∀ r
  . Event { x :: Number, y :: Number | r }
  → Attr
