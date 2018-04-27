module Alchemy.Pixi.Graphics
  ( Color(..)
  , Ref
  , rect
  , circle
  , setPos
  ) where

import Prelude

import Alchemy.Pixi.Application (Stage)
import Control.Monad.Eff (Eff)

newtype Color = Color Int

-- | Reference to a pixi graphic or sprite
newtype Ref = Ref Int

foreign import circle ::
  ∀ eff
  . Stage
  → Color
  → Number
  → Eff eff Ref

foreign import rect ::
  ∀ eff
  . Stage
  → Color
  → Number
  → Number
  → Eff eff Ref

foreign import setPos ::
  ∀ r eff
  . Array { pixiRef :: Ref, x :: Number, y :: Number | r }
  → Eff eff Unit
