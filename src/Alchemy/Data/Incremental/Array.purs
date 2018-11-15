module Alchemy.Data.Incremental.Array
   ( ArrayUpdate(..)
   , IArray
   , array
   ) where

import Prelude

import Alchemy.Data.Incremental (IValue(..), Increment)


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
         , patch: unsafePatchArray a
         }


unsafePatchArray ::
  ∀ a da
  . Array (IValue a da)
 -> ArrayUpdate a da
 -> Increment (Array (IValue a da)) (ArrayUpdate a da)
unsafePatchArray arr (InsertAt i v) =
  { new: array $ unsafeInsertAt i v arr
  , delta: InsertAt i v
  }

unsafePatchArray arr (DeleteAt i) =
  { new: array $ unsafeDeleteAt i arr
  , delta: DeleteAt i
  }

unsafePatchArray arr (UpdateAt i delta) =
  let { result, applied } = unsafeUpdateAt i delta arr
   in { new: array result
      , delta: UpdateAt i applied
      }

foreign import unsafeUpdateAt :: ∀ a da.
  Int -> da -> Array a -> { result :: Array a, applied :: da }

foreign import unsafeInsertAt :: ∀ a.
  Int -> a -> Array a -> Array a

foreign import unsafeDeleteAt :: ∀ a.
  Int -> Array a -> Array a
