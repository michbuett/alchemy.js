module Alchemy.DOM
  ( DOM
  , Node
  , render
  ) where



import Alchemy.FRP.Stream (Stream)
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
  → Eff e1 (Stream (Eff e2 Unit))
