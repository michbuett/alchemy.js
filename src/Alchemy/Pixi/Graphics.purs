module Alchemy.Pixi.Graphics
  ( Color(..)
  , Ref
  , rect
  , updatePos
  , assign
  ) where

import Prelude

import Alchemy.Pixi (PIXI)
import Alchemy.Pixi.Application (Stage)
import Control.Monad.Eff (Eff)

newtype Color = Color Int

-- | Reference to a pixi graphic or sprite
newtype Ref = Ref Int

foreign import rect ::
  ∀ e
  . Stage
  → Color
  → Int
  → Int
  → Eff ( pixi :: PIXI | e ) Ref

foreign import updatePos ::
  ∀ r e
  . { pixiRef :: Ref, x :: Number, y :: Number | r }
  → Eff ( pixi :: PIXI | e) Unit

foreign import assign :: ∀ r s t. Union r s t => Record r → Record s → Record t
