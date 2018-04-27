module Alchemy.Pixi.Application
  ( Application
  , Stage
  , Options
  , defaults
  , init
  , stage
  ) where

import Control.Monad.Eff (Eff)

foreign import data Application :: Type
foreign import data Stage :: Type

type Options =
  { width :: Int
  , height :: Int
  , resolution :: Int
  }

defaults :: Options
defaults =
  { width: 800
  , height: 600
  , resolution: 1
  }

foreign import init ::
  ∀ eff
  . Options
  → String
  → Eff eff Application

foreign import stage :: Application → Stage
