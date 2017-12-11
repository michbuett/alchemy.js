module Alchemy.Pixi.Application
  ( Application
  , Stage
  , Options
  , defaults
  , init
  , stage
  , tick
  ) where

import Control.Monad.Eff (Eff)
import DOM (DOM)
import Alchemy.Pixi (PIXI)
import Alchemy.FRP.Channel (FRP, Channel, channel)

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
  ∀ e
  . Options
  → String
  → Eff (pixi :: PIXI, dom :: DOM | e) Application

foreign import stage :: Application → Stage

foreign import tickP :: ∀ a e
  . Eff (frp :: FRP | e) (Channel a)
  → Application
  → Eff (pixi :: PIXI, frp :: FRP | e) (Channel Number)

tick :: ∀ e
  . Application
  → Eff (pixi :: PIXI, frp :: FRP | e) (Channel Number)
tick = tickP channel
