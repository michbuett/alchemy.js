module Alchemy.Data.Incremental.Record
   ( class RecordPatchRL
   , class RecordChangeRL
   , assign
   , assign'
   , prop
   ) where


import Prelude

import Alchemy.Data.Increment.Value (IVal(..))
import Alchemy.Data.Incremental (Increment, Patch(..), fromChange, liftValue, runPatch)
import Alchemy.Data.Incremental.Types (class Patchable, Change)
import Data.Maybe (Maybe(..), isJust)
import Data.Symbol (class IsSymbol)
import Prim.Row as Row
import Prim.RowList as RL
import Record.Unsafe (unsafeGet)
import Type.Prelude (SProxy, reflectSymbol)
import Type.Row (Nil, kind RowList)
-- import Unsafe.Coerce (unsafeCoerce)

-- type PRecord r d = Patch (Record d) (Record r) (Record r)


class RecordPatchRL (r :: # Type ) (rl :: RowList) (p :: # Type) (pl :: RowList)
        | rl -> r, pl -> p, pl -> rl, rl -> pl

instance recordPatchRLNil :: RecordPatchRL () Nil () Nil

instance recordPatchRLCons
  :: ( IsSymbol l
     , RecordPatchRL r1 rl p1 pl
     , Row.Cons l a r1 r2
     , Row.Cons l (Patch a) p1 p2
     , Row.Lacks l r1
     , Row.Lacks l p1
     )
  => RecordPatchRL r2 (RL.Cons l a rl) p2 (RL.Cons l (Patch a) pl)


class RecordChangeRL (p :: # Type) (pl :: RowList) (d :: # Type) (dl :: RowList)
         | dl -> pl, pl -> dl, dl -> d, pl -> p

instance changeRLNil :: RecordChangeRL () Nil () Nil

instance changeRLCons
  :: ( IsSymbol l
     , RecordChangeRL p1 pl d1 dl
     , Row.Cons l (Patch a) p1 p2
     , Row.Cons l (Maybe (Change a)) d1 d2
     , Row.Lacks l p1
     , Row.Lacks l d1
     )
  => RecordChangeRL p2 (RL.Cons l (Patch a) pl) d2 (RL.Cons l (Maybe (Change a)) dl)

assign ::
  ∀ r rl s rs d dl t dt p pl
  . RL.RowToList r rl
 => RL.RowToList p pl
 => RL.RowToList d dl
 => Row.Union r s rs
 => Row.Union d t dt
 => RecordChangeRL p pl d dl
 => RecordPatchRL r rl p pl
 => Patchable (Record rs) (Record dt)
 => Record p
 -> Patch (Record rs)
assign dr = unsafePatchRecord isJust Just Nothing dr

assign' :: ∀ r. (Record r -> Patch (Record r)) -> Patch (Record r)
assign' f = Patch \r -> runPatch (f r) r

foreign import unsafePatchRecord ::
  ∀ a b
  . (∀ c. Maybe c -> Boolean) -- isJust
 -> (∀ c. c -> Maybe c) -- Just
 -> (∀ c. Maybe c) -- Nothing
 -> a
 -> b


prop ::
  ∀ l a d rs r
  . IsSymbol l => Row.Cons l a rs r => Patchable (Record r) (Record d)
 => SProxy l -> (Record r) -> IVal (Increment (Record r)) a
prop key r0 =
  prop' $ liftValue r0
  where
    k = (reflectSymbol key)
    prop' ir = IVal
      { inc:
        { new: unsafeGet k ir.new
        , delta: ir.delta >>= \dr -> unsafeGet k (fromChange dr)
        }
      , next: prop'
      }

-- t = if _ then "foo" else "bar"
-- prop ::
--   ∀ l a d rs r
--   . IsSymbol l => Row.Cons l a rs r => Patchable (Record r) (Record d)
--  => SProxy l -> Increment (Record r) -> Increment a
-- prop key { new, delta } =
--   let k = (reflectSymbol key) in
--   { new: unsafeGet k new
--   , delta: delta <#> (\dr -> unsafeGet k (fromChange dr))
--   }


-- import Alchemy.Data.Incremental (class Change, Patch)
-- import Data.Maybe (Maybe(..), isJust)
-- import Data.Symbol (class IsSymbol)
-- import Prim.Row as Row
-- import Prim.RowList as RL
-- import Type.Row (Nil, kind RowList)
--
-- type PRecord r d = Patch (Record d) (Record r) (Record r)
--
--
-- class RecordPatchRL (r :: # Type ) (rl :: RowList) (p :: # Type) (pl :: RowList)
--         | rl -> r, pl -> p, pl -> rl, rl -> pl
--
-- instance recordPatchRLNil :: RecordPatchRL () Nil () Nil
--
-- instance recordPatchRLCons
--   :: ( IsSymbol l
--      , RecordPatchRL r1 rl p1 pl
--      , Row.Cons l a r1 r2
--      , Row.Cons l (Patch d a a ) p1 p2
--      , Row.Lacks l r1
--      , Row.Lacks l p1
--      )
--   => RecordPatchRL r2 (RL.Cons l a rl) p2 (RL.Cons l (Patch d a a) pl)
--
--
-- class RecordChangeRL (p :: # Type) (pl :: RowList) (d :: # Type) (dl :: RowList)
--          | dl -> pl, pl -> dl, dl -> d, pl -> p
--
-- instance changeRLNil :: RecordChangeRL () Nil () Nil
--
-- instance changeRLCons
--   :: ( IsSymbol l
--      , RecordChangeRL p1 pl d1 dl
--      , Row.Cons l (Patch da a a) p1 p2
--      , Row.Cons l (Maybe da) d1 d2
--      , Row.Lacks l p1
--      , Row.Lacks l d1
--      )
--   => RecordChangeRL p2 (RL.Cons l (Patch da a a) pl) d2 (RL.Cons l (Maybe da) dl)
--
-- assign ::
--   ∀ r rl s rs d dl t dt p pl
--   . RL.RowToList r rl
--  => RL.RowToList p pl
--  => RL.RowToList d dl
--  => Row.Union r s rs
--  => Row.Union d t dt
--  => RecordChangeRL p pl d dl
--  => RecordPatchRL r rl p pl
--  => Change (Record dt) (Record rs) (Record rs)
--  => Record p
--  -> PRecord rs dt
-- assign dr = unsafePatchRecord isJust Just Nothing dr
--
-- foreign import unsafePatchRecord ::
--   ∀ a b
--   . (∀ c. Maybe c -> Boolean) -- isJust
--  -> (∀ c. c -> Maybe c) -- Just
--  -> (∀ c. Maybe c) -- Nothing
--  -> a
--  -> b
