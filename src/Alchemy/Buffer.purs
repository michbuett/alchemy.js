module Alchemy.Buffer
  ( Buffer
  , bufferSignal
  , drain
  )
  where

import Signal (Signal)

foreign import data Buffer :: Type -> Type

foreign import bufferSignal :: forall a. Signal a -> Buffer a

foreign import drain :: forall a. Buffer a -> Array a
