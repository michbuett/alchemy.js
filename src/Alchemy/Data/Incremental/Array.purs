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


instance eqArrayUpdate :: (Eq a, Eq da) => Eq (ArrayUpdate a da) where
  eq (InsertAt i1 v1) (InsertAt i2 v2) = i1 == i2 && (eq v1 v2)
  eq (DeleteAt i1) (DeleteAt i2) = i1 == i2
  eq (UpdateAt i1 v1) (UpdateAt i2 v2) = i1 == i2 && (eq v1 v2)
  eq _ _ = false

instance showArrayUpdate :: (Show a, Show da) => Show (ArrayUpdate a da) where
  show (InsertAt i v) = "InsertAt(" <> (show i) <> ", " <> (show v) <> ")"
  show (DeleteAt i) = "DeleteAt(" <> (show i) <> ")"
  show (UpdateAt i v) = "UpdateAt(" <> (show i) <> ", " <> (show v) <> ")"

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
