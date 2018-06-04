module Alchemy.Graphics2d
  ( Scene
  , Options
  , Ressource
  , Graphic
  , defaults
  , render
  ) where

import Alchemy.FRP.Subscription (Subscription)

foreign import data Ressource :: Type
foreign import data Scene :: Type

newtype Graphic = Graphic (Ressource → Subscription)

type Options =
  { width :: Int
  , height :: Int
  }

defaults :: Options
defaults =
  { width: 800
  , height: 600
  }

foreign import render ::
  Options → String → Graphic → Subscription
