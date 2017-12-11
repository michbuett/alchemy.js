module Alchemy.Pixi.Graphics
  ( Color(..)
  , Ref
  , rect
  , circle
  , setPos
  ) where

import Prelude

import Alchemy.Pixi (PIXI)
import Alchemy.Pixi.Application (Stage)
import Control.Monad.Eff (Eff)

newtype Color = Color Int

-- | Reference to a pixi graphic or sprite
newtype Ref = Ref Int

foreign import circle ::
  ∀ e
  . Stage
  → Color
  → Number
  → Eff ( pixi :: PIXI | e ) Ref

foreign import rect ::
  ∀ e
  . Stage
  → Color
  → Number
  → Number
  → Eff ( pixi :: PIXI | e ) Ref

foreign import setPos ::
  ∀ r e
  . { pixiRef :: Ref, x :: Number, y :: Number | r }
  → Eff ( pixi :: PIXI | e) Unit
