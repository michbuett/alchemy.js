module Alchemy.Data.Incremental.Record
   ( class IRecordRL
   , RecordUpdate
   , IRecord
   , record
   , mergeRec
   ) where

import Prelude

import Alchemy.Data.Incremental (IValue(..), Increment)
import Data.Symbol (class IsSymbol)
import Prim.Row as Row
import Prim.RowList as RL
import Type.Row (Nil, kind RowList)
import Unsafe.Coerce (unsafeCoerce)


type IRecord r = IValue (Record r) (RecordUpdate r)


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

newtype RecordUpdate d =
  RecordUpdate (
    ∀ r rl dl
    . RL.RowToList r rl
   => RL.RowToList d dl
   => IRecordRL r rl d dl
   => Record r
   )

instance showRecordUpdate :: Show (RecordUpdate r) where
  show = unsafeShow

instance eqRecordUpdate :: Eq (RecordUpdate r) where
  eq = unsafeEq


foreign import unsafeShow :: ∀ a. a -> String
foreign import unsafeEq:: ∀ a b. a -> b -> Boolean

mergeRec
 :: ∀ r rl d dl
  . RL.RowToList r rl
 => RL.RowToList d dl
 => IRecordRL r rl d dl
 => Record d -> RecordUpdate r
mergeRec = unsafeCoerce


record
 :: ∀ r. Record r -> IRecord r
record r =
  IValue $ { value: r
           , patch: unsafePatchRecord r
           }


foreign import unsafePatchRecord ::
  ∀ r. Record r -> RecordUpdate r -> Increment (Record r) (RecordUpdate r)
