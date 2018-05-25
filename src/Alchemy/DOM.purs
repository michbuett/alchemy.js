module Alchemy.DOM
  ( DOM
  , Node
  , render
  ) where



import Alchemy.FRP.TimeFunction (TF)
import Control.Monad.Eff (Eff)
import Prelude (Unit)

foreign import data Node :: Type

newtype DOM = DOM
  ( ∀ e
    . Node
    → Eff () { updates :: Array (Eff e Unit)
             , remove :: Eff e Unit
             }
  )

foreign import render :: ∀ e1 e2
  . String
  → DOM
  → Eff e1 (TF (Eff e2 Unit))
