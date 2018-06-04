module Alchemy.Graphics2d.Container
  ( array
  , box
  , zlayer
  ) where

import Alchemy.FRP.TimeFunction (TF)
import Alchemy.Graphics2d (Graphic)
import Prelude

foreign import arrayImpl :: ∀ m
  . ((Array m → m) → TF (Array m) → TF m)
  → (TF m → Graphic)
  → TF (Array m) → Graphic

array :: ∀ m.
  (TF m → Graphic) → TF (Array m) → Graphic
array createChildFn arrayS =
  arrayImpl map createChildFn arrayS

foreign import box ::
  Array Graphic → Graphic

foreign import zlayer ::
  Array Graphic → Graphic

