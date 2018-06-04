module Alchemy.Graphics2d.Container
  ( array
  , box
  , zlayer
  ) where

import Prelude

import Alchemy.FRP.ReactiveValue (RV)
import Alchemy.Graphics2d (Graphic)
import Data.Function.Uncurried (Fn3, runFn3)

foreign import arrayImpl :: ∀ m.
  Fn3 ((Array m → m) → RV (Array m) → RV m)
      (RV m → Graphic)
      (RV (Array m))
      Graphic

array :: ∀ m.
  (RV m → Graphic) → RV (Array m) → Graphic
array =
  runFn3 arrayImpl map

foreign import box ::
  Array Graphic → Graphic

foreign import zlayer ::
  Array Graphic → Graphic

