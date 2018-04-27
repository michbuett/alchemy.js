module Alchemy.Graphics2d.Attributes
  ( Attr
  , pos
  )
  where

import Prelude

import Alchemy.FRP.Stream (Stream)
import Alchemy.Graphics2d (Ressource)
import Control.Monad.Eff (Eff)

newtype Attr = Attr (Ressource → Eff () Unit)

foreign import setPos :: ∀ r
  . Stream { x :: Number, y :: Number | r }
  → Ressource
  → Eff () Unit

pos :: ∀ r
  . Stream { x :: Number, y :: Number | r }
  → Attr
pos s =
  Attr $ setPos s
