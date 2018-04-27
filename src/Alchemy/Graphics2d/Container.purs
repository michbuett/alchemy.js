module Alchemy.Graphics2d.Container
  ( array
  , box
  , zlayer
  ) where

import Alchemy.FRP.Stream (Stream)
import Alchemy.Graphics2d (Graphic)
import Prelude

foreign import arrayImpl :: ∀ m
  . ((Array m → m) → Stream (Array m) → Stream m)
  → (Stream m → Graphic)
  → Stream (Array m) → Graphic

array :: ∀ m.
  (Stream m → Graphic) → Stream (Array m) → Graphic
array createChildFn arrayS =
  arrayImpl map createChildFn arrayS

foreign import box ::
  Array Graphic → Graphic

foreign import zlayer ::
  Array Graphic → Graphic

