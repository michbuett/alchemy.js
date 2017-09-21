module Alchemy.Pixi.Application
  ( Application
  , Stage
  , Options
  , body
  , defaults
  , init
  , stage
  , tick
  , loop
  ) where

import Prelude (Unit)
import Control.Monad.Eff (Eff)
import DOM (DOM)
import DOM.Node.Types (Node)
import Alchemy.Pixi (PIXI)
import Signal (Signal, constant)

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
  → Node
  → Eff ( pixi :: PIXI, dom :: DOM | e ) Application

foreign import body :: ∀ e. Eff (dom :: DOM | e) Node

foreign import stage :: Application → Stage

foreign import tickP ::
  ∀ a e
  . (a → Signal a)
  → Application
  → Eff ( pixi :: PIXI | e ) (Signal Number)

tick :: ∀ e . Application → Eff ( pixi :: PIXI | e ) (Signal Number)
tick = tickP constant

foreign import loop :: ∀ e. Application → Signal Number → Eff (pixi :: PIXI | e) Unit
