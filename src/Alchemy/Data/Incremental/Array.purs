module Alchemy.Data.Incremental.Array
   ( ArrayUpdate(..)
   , IArray
   , array
   ) where

import Prelude

import Alchemy.Data.Incremental (IValue(..))


type IArray a da = IValue (Array (IValue a da)) (ArrayUpdate a da)


data ArrayUpdate a da
  = InsertAt Int (IValue a da)
  | DeleteAt Int
  | UpdateAt Int da


array ::
  ∀ a da. Array (IValue a da) -> IArray a da
array a =
  IValue { value: a
         , patch: patchArray a
         }

patchArray ::
  ∀ a da. Array (IValue a da) -> ArrayUpdate a da -> IArray a da
patchArray arr (InsertAt i v) =
  array $ unsafeInsertAt i v arr

patchArray arr (DeleteAt i) =
  array $ unsafeDeleteAt i arr

patchArray arr (UpdateAt i delta) =
  array $ unsafeUpdateAt i delta arr

foreign import unsafeUpdateAt :: ∀ a da.
  Int -> da -> Array a -> Array a

foreign import unsafeInsertAt :: ∀ a.
  Int -> a -> Array a -> Array a

foreign import unsafeDeleteAt :: ∀ a.
  Int -> Array a -> Array a
