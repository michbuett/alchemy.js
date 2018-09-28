module Alchemy.Data.Incremental2
   ( Change
   , patch
   , Atomic(..)
   , AtomicUpdate
   , changeAtomic
   , class ChangeRL
   , changeRecord
   , ArrayUpdate
   , changeArray
   ) where

import Prelude

import Data.Array (foldr)
import Data.Newtype (class Newtype)
import Data.Symbol (class IsSymbol)
import Prim.Row as Row
import Prim.RowList as RL
import Type.Row (Nil, kind RowList)


newtype Change a da = Change { delta :: da, patch :: (a -> a) }


-- | Create a new value based on a given change
patch :: ∀ a da. Change a da -> a -> a
patch (Change { patch: f }) = f



------------------------------------------------------------
-- Update an atomic value

newtype Atomic a = Atomic a

derive instance eqAtomic :: Eq a => Eq (Atomic a)
derive instance ordAtomic :: Ord a => Ord (Atomic a)
derive instance newtypeAtomic :: Newtype (Atomic a) _

instance showAtomic :: Show a => Show (Atomic a) where
  show (Atomic a) = "Atomic(" <> show a <> ")"

newtype AtomicUpdate a = AtomicUpdate a


changeAtomic :: ∀ a. a -> Change (Atomic a) (AtomicUpdate a)
changeAtomic newVal =
  Change { delta: AtomicUpdate newVal
         , patch: (\_ -> Atomic newVal)
         }



------------------------------------------------------------
-- Update the values of a record


class ChangeRL (r :: # Type ) (rl :: RowList) (d :: # Type) (dl :: RowList)
        | rl -> r, dl -> d, dl -> rl

instance changeRLNil :: ChangeRL r rl () Nil

instance changeRLCons
  :: ( IsSymbol l
     , ChangeRL r1 rl d1 dl
     , Row.Cons l a r1 r2
     , Row.Cons l (Change a da) d1 d2
     , Row.Lacks l r1
     , Row.Lacks l d1
     )
  => ChangeRL r2 rl d2 (RL.Cons l (Change a da) dl)


changeRecord
  :: ∀ r rl d dl
  . RL.RowToList r rl
 => RL.RowToList d dl
 => ChangeRL r rl d dl
 => Record d -> Change (Record r) (Record d)
changeRecord rd =
  Change { delta: rd
         , patch: unsafePatchRecord rd
         }


foreign import unsafePatchRecord ::
  ∀ r rd. Record rd -> Record r -> Record r



------------------------------------------------------------
-- Update the values of an array


data ArrayUpdate a da
  = InsertAt Int a
  | DeleteAt Int
  | UpdateAt Int (Change a da)


changeArray ::
  ∀ a da
  . Array (ArrayUpdate a da)
 -> Change (Array a) (Array (ArrayUpdate a da))
changeArray d =
  Change { delta: d
         , patch: patchArray d
         }

patchArray ::
  ∀ a da
  . Array (ArrayUpdate a da)
 -> Array a
 -> Array a
patchArray deltas a =
  foldr patchOne (cloneArray a) deltas
  where
        patchOne :: ArrayUpdate a da -> Array a -> Array a
        patchOne (InsertAt i v) resultSoFar =
          unsafeInsertAt i v resultSoFar

        patchOne (DeleteAt i) resultSoFar =
          unsafeDeleteAt i resultSoFar

        patchOne (UpdateAt i (Change { patch: p })) resultSoFar =
          unsafeUpdateAt i p resultSoFar


foreign import cloneArray :: ∀ a.
  Array a -> Array a

foreign import unsafeUpdateAt :: ∀ a.
  Int -> (a -> a) -> Array a -> Array a

foreign import unsafeInsertAt :: ∀ a.
  Int -> a -> Array a -> Array a

foreign import unsafeDeleteAt :: ∀ a.
  Int -> Array a -> Array a
