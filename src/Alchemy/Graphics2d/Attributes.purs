module Alchemy.Graphics2d.Attributes
  ( Attr
  , pos
  )
  where

import Prelude

import Alchemy.FRP.TimeFunction (TF)
import Alchemy.Graphics2d (Ressource)
import Control.Monad.Eff (Eff)

newtype Attr = Attr (Ressource → Eff () Unit)

foreign import setPos :: ∀ r
  . TF { x :: Number, y :: Number | r }
  → Ressource
  → Eff () Unit

pos :: ∀ r
  . TF { x :: Number, y :: Number | r }
  → Attr
pos s =
  Attr $ setPos s
