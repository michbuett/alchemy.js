module Alchemy.Graphics2d
  ( Scene
  , Options
  , Ressource
  , Graphic
  , defaults
  , render
  ) where

import Prelude
import Alchemy.FRP.TimeFunction (TF)
import Control.Monad.Eff (Eff)

foreign import data Ressource :: Type
foreign import data Scene :: Type

newtype Graphic = Graphic
  ( ∀ e
    . Ressource
    → Eff () { update :: Eff e Unit
             , remove :: Eff e Unit
             }
  )

type Options =
  { width :: Int
  , height :: Int
  }

defaults :: Options
defaults =
  { width: 800
  , height: 600
  }

foreign import render :: ∀ e1 e2
  . Options
  → String
  → Graphic
  → Eff e1 (TF (Eff e2 Unit))
