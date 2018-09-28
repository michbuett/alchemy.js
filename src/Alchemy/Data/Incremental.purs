module Alchemy.Data.Incremental
   ( IValue
   , patch
   , value
   , Atomic(..)
   , atomic
   , class IRecordRL
   , record
   , ArrayUpdate(..)
   , array
   ) where

import Prelude

import Data.Newtype (class Newtype)
import Data.Symbol (class IsSymbol)
import Prim.Row as Row
import Prim.RowList as RL
import Type.Row (Nil, kind RowList)


newtype IValue a da = IValue { value :: a, patch :: (da -> IValue a da) }

instance showIValue :: Show a => Show (IValue a da) where
  show (IValue { value: v }) = "IValue(" <> show v <> ")"

instance eqIValue :: Eq a => Eq (IValue a da) where
  eq (IValue { value: v1 }) (IValue { value: v2 }) = eq v1 v2

-- | Create a new value based on a given change
patch :: ∀ a da. IValue a da -> da -> IValue a da
patch (IValue { patch: f }) = f

value :: ∀ a da. IValue a da -> a
value (IValue { value: v }) = v

------------------------------------------------------------
-- Update an atomic value

newtype Atomic a = Atomic a

derive instance eqAtomic :: Eq a => Eq (Atomic a)
derive instance ordAtomic :: Ord a => Ord (Atomic a)
derive instance newtypeAtomic :: Newtype (Atomic a) _

instance showAtomic :: Show a => Show (Atomic a) where
  show (Atomic a) = "Atomic(" <> show a <> ")"


atomic :: ∀ a. a -> IValue (Atomic a) a
atomic x =
  IValue $ { value: Atomic x
           , patch: atomic
           }



------------------------------------------------------------
-- Update the values of a record


class IRecordRL (r :: # Type ) (rl :: RowList) (d :: # Type) (dl :: RowList)
        | rl -> r, dl -> d, dl -> rl

instance changeRLNil :: IRecordRL r rl () Nil

instance changeRLCons
  :: ( IsSymbol l
     , IRecordRL r1 rl d1 dl
     , Row.Cons l (IValue a da) r1 r2
     , Row.Cons l da d1 d2
     , Row.Lacks l r1
     , Row.Lacks l d1
     )
  => IRecordRL r2 rl d2 (RL.Cons l da dl)


record
 :: ∀ r rl d dl
  . RL.RowToList r rl
 => RL.RowToList d dl
 => IRecordRL r rl d dl
 => Record r -> IValue (Record r) (Record d)
record r =
  IValue $ { value: r
           , patch: unsafePatchRecord r
           }


foreign import unsafePatchRecord ::
  ∀ r d. Record r -> Record d -> IValue (Record r) (Record d)



------------------------------------------------------------
-- Update the values of an array


data ArrayUpdate a da
  = InsertAt Int (IValue a da)
  | DeleteAt Int
  | UpdateAt Int da


array ::
  ∀ a da
  . Array (IValue a da)
 -> IValue (Array (IValue a da)) (ArrayUpdate a da)
array a =
  IValue { value: a
         , patch: patchArray a
         }

patchArray ::
  ∀ a da
  . Array (IValue a da)
 -> ArrayUpdate a da
 -> IValue (Array (IValue a da)) (ArrayUpdate a da)
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
