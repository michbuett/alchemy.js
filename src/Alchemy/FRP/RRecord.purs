module Alchemy.FRP.RRecord
   where

import Prelude

import Alchemy.FRP.Event (Channel, openChannel)
import Data.Array (foldr)
import Data.Function.Uncurried (Fn2, Fn3, runFn2, runFn3)
import Data.Newtype (class Newtype, unwrap)
import Data.Symbol (class IsSymbol, SProxy(..), reflectSymbol)
import Effect (Effect)
import Prim.Row as Row
import Prim.RowList as RL
import Type.Row (Nil, kind RowList)
import Unsafe.Coerce (unsafeCoerce)
-- import Prim.Row (class Cons, class Union)

data RecordUpdate l a = Set l a

newtype Atomic a = Atomic a

derive instance eqAtomic :: Eq a => Eq (Atomic a)
derive instance ordAtomic :: Ord a => Ord (Atomic a)
derive instance newtypeAtomic :: Newtype (Atomic a) _

instance showAtomic :: Show a => Show (Atomic a) where
  show (Atomic a) = "Atomic(" <> show a <> ")"

newtype AtomicUpdate a = AtomicUpdate a

-- data AtomicUpdate a = Noop | Replace a
--
--  instance monoidAtomicUpdate :: Monoid (AtomicUpdate a) where
--    mempty = Noop
--
--  instance semigroupAtomicUpdate :: Semigroup (AtomicUpdate a) where
--    append _ (Replace a) = Replace a
--    append (Replace a) Noop = Replace a
--    append Noop Noop = Noop
--
--  newtype Notification = Notification (Effect Unit)
--
--  data PatchResult a = PatchResult a Notification
--
--  class OPatch a da o | a -> da where
--    opatch :: (da -> a -> o) -> a -> da -> { result :: a, observation :: o }
--
--  -- to general => overlapping
--  -- instance opatchPatch :: Patch a a => OPatch a a o where
--  --   opatch obs x =
--  --     makeObservable obs (patch x)
--
--  -- newtype RecordUpdate2 r = RecordUpdate2 (Record r)
--  --
--  -- class RowSubset (r :: # Type) (s :: # Type)
--  -- instance rowSubset :: Union r t s => RowSubset r s
--  --
--  -- instance opatchRecord
--  --     :: (RowSubset sub r, OPatch a da (Array o))
--  --     => OPatch (Record r) (RecordUpdate2 sub) (Array o)
--  --     where
--  --   opatch obs r dr =
--  --     { result: r, observation: [] }
--  --
--  -- foreign import
--
--  instance opatchAtomic :: Monoid o => OPatch (Atomic a) (AtomicUpdate a) o where
--    opatch obs _ (Replace new) =
--      { result: Atomic new, observation: obs (Replace new) (Atomic new) }
--    opatch _ (Atomic old) Noop =
--      { result: Atomic old, observation: mempty }
--
--  instance opatchRStateRecord
--      :: (IsSymbol l, Row.Cons l a rs r, OPatch a da (Array o))
--      => OPatch (Record r) (Array (RecordUpdate (SProxy l) da)) (Array o)
--      where
--    opatch obs r dr =
--      foldr patchOne { result: r, observation: [] } dr
--      where patchOne (Set l g) resultSoFar =
--              -- let currVal = get (reflectSymbol l)
--              --     newVal = opatch obs currVal g
--              --  in
--              resultSoFar
--
--            get = unsafeGet r
--
--  -----------------------------------------------------------
--  -----------------------------------------------------------
--  -----------------------------------------------------------
--  -----------------------------------------------------------

-- class PatchRL r (rl :: RowList) d (dl :: RowList) | rl -> r, dl -> d, rl -> dl where
--   patchRL :: RLProxy rl -> RLProxy dl -> Record r -> Record d -> Record r
--
-- instance patchRLNil :: PatchRL () Nil () Nil where
--   patchRL _ _ _ _ = {}
--
-- instance patchRLCons
--     :: ( IsSymbol l
--        , Patchable a m
--        , PatchRL r1 rl d1 dl
--        , Row.Cons l a r1 r2
--        , Row.Cons l m d1 d2
--        , Row.Lacks l r1
--        , Row.Lacks l d1
--        )
--     => PatchRL r2 (Cons l a rl) d2 (Cons l m dl) where
--   patchRL _ _ x y =
--     x
--
--  foreign import patchOneRecordEntry ::
--    ∀ a da r r1 d d1 l
--    . Patch a da
--   => IsSymbol l
--   => Row.Cons l a r1 r
--   => Row.Cons l da d1 d
--   => { source :: Record r
--      , target :: Record r1
--      , changes :: Record d
--      , key :: SProxy l
--      }
--   -> Record r
--
--  test :: { foo :: Atomic String }
--  test = patchOneRecordEntry
--            { source: { foo: Atomic "Foo" }
--            , target: {}
--            , changes: { foo: (Replace "FOOFOO") }
--            , key: SProxy :: SProxy "foo"
--            }
--
--  --- recordChange2changeList
--
--  --      Record.insert l
--  --        (patch (Record.get l x) (Record.get l y))
--  --        rest
--  --    where
--  --      l = SProxy :: SProxy l
--  --
--  --      rest :: Record r1
--  --      rest = patchRL (RLProxy :: RLProxy rl) (RLProxy :: RLProxy dl) (Record.delete l x) (Record.delete l y)
--
--  makeObservable ::
--    ∀ a b o. (a -> b -> o) -> (a -> b) -> a -> { result :: b, observation :: o }
--  makeObservable observe fn i =
--    let o = fn i
--     in { result: o
--        , observation: observe i o
--        }
--
--  foreign import unsafeSet :: ∀ r a. Record r -> String -> a -> Record r
--
--  foreign import unsafeGet :: ∀ r a. Record r -> String -> a
--
--  class Monoid da <= Patch a da | a -> da where
--    patch :: a -> da -> a
--
--  replace :: ∀ a. a -> a -> a
--  replace _ newVal = newVal
--
--  instance patchAtomic :: Patch (Atomic a) (AtomicUpdate a) where
--    patch _ (Replace new) = Atomic new
--    patch (Atomic old) Noop = Atomic old
--
--  instance patchRecord
--      :: (IsSymbol l, Row.Cons l a rs r, Patch a da)
--      => Patch (RRecord r) (Array (RecordUpdate (SProxy l) da))
--      where
--    patch r rs = r
--
--  -- instance patchRStateRecord
--  --     :: (IsSymbol l, Cons l a rs r, Patch a da)
--  --     => Patch (RState (Record r)) (Array (RecordUpdate (SProxy l) da))
--  --     where
--  --   patch r rs = r
--  --
--  -- instance patchRStateAtomic
--  --   :: Patch (RState (Atomic a)) (AtomicUpdate a)
--  --   where
--  --   patch s _ = s
--
--  -- else instance patchAtomic :: Monoid a => Patch a (Atomic a) where
--  --   patch _ (Replace newVal) = newVal
--  --   patch oldVal Noop = oldVal
--
--  foreign import data RState :: Type -> Type
--
--  foreign import data RRecord :: # Type -> Type
--
--  foreign import create ::
--    ∀ a b. Fn2 (Effect (Channel a a)) a b
--
--  foreign import unsafeMerge ::
--    ∀ a b c. Record a -> Record b -> Record c
--
--
--  constant :: ∀ a. a -> RState a
--  constant = runFn2 create openChannel
--
--  fromRecord :: ∀ r. Record r -> RRecord r
--  fromRecord = runFn2 create openChannel
--
--  foreign import debugShow ::
--    ∀ a. String -> a -> String
--
--  instance showRState :: Show (RState a) where
--    show = debugShow "RState"
--
--  instance showRRecord :: Show (RRecord a) where
--    show = debugShow "RRecord"
--
--
--  foreign import modify ::
--    ∀ a da. Patch (RRecord a) da => (Record a -> da) -> RRecord a -> Effect Unit
--
--
--  foreign import updateImpl ::
--    ∀ a r. Fn3 String a (RRecord r) (RRecord r)
--
--  update ::
--    ∀ l a rs r
--    . IsSymbol l => Row.Cons l a rs r
--   => SProxy l -> a -> RRecord r -> RRecord r
--  update l = runFn3 updateImpl (reflectSymbol l)
--
--  --applyChange changesChannel (Set key change) rval =
--  --  let subVal = get key rval
--  --      newVal = set key (patch subVal change)
--
--
--  -- changes :: Event { value: a, change: Change da } -> Event (Change a)
--  -- values :: Event { value: a, change: Change da } -> Event a
--  --------------------------------------------------
--  --------------------------------------------------
--  s :: RRecord F
--  s = fromRecord { foo: Atomic "FOO", bar: Atomic "Bar" }
--
--  s' :: Effect Unit
--  s' = modify f s
--    where -- f :: ∀ l. IsSymbol l => F -> Array (RecordUpdate (SProxy l) String)
--          f _ = [ Set (SProxy :: SProxy "foo") (Replace "FOOFOO")
--                ]
--
--
--
--
--  ------------------------------------------------------------
--  ------------------------------------------------------------
--  ------------------------------------------------------------
--  ------------------------------------------------------------
--
--  r = { foo: "Foo"
--      , bar: "Bar"
--      , baz: "Baz"
--      }
--
--  newtype RecordPatch r = RecordPatch (∀ l a rs. IsSymbol l => Row.Cons l a rs r => Record r)
--
--  class toApply da where
--    toPatch :: da -> Patch da a
--
--
-- newtype Patch a = Patch (a -> a)
-- derive instance newtypePatch :: Newtype (Patch a) _
--
-- patch :: ∀ a. Patch a -> a -> a
-- patch (Patch fn) x = fn x
--
-- class Patchable a da where
-- -- class Patchable a da | a -> da where
--   toPatch :: da -> Patch a
--
-- instance patchableAtomic :: Patchable (Atomic a) (AtomicUpdate a) where
--   toPatch (Replace newVal) = Patch (\_ -> Atomic newVal)
--   toPatch Noop = Patch identity
--
--instance patchableRecord
--  :: Patchable (Record r) (Record s)
--  where
--    toPatch changes = Patch patchFn
--      where patchFn :: Record r -> Record r
--            patchFn = unsafeCoerce (unsafePatchRecord changes)
--
--            changeList = parseChanges changes
--
--            patchList :: ∀ p. Array { key :: String, patch :: p }
--            patchList = unsafeCoerce mapChanges <$> changeList
--
--            mapChanges :: ∀ a da. Patchable a da => { key :: String, change :: da } -> { key :: String, patch :: Patch a }
--            mapChanges { key, change } = { key: key, patch: toPatch change }
--
--instance patchableRecord
--  :: (IsSymbol l, Row.Cons l a rs r, Patchable a da)
--  => Patchable (Record r) (Array (RecordUpdate (SProxy l) da))
--  where
--  toPatch changes =
--    Patch (\r -> foldr unsafePatchOne (cloneRecord r) changes)
--    where -- patchOne :: RecordUpdate (SProxy l) -> Record r -> Record r
--          unsafePatchOne (Set l da) r =
--            let p :: Patch a
--                p = toPatch da
--             in
--            patchOneRecordEntry (reflectSymbol l) (unwrap p) r

--  class PatchRL r (rl :: RowList) d (dl :: RowList) | rl -> r, dl -> d, rl -> dl where
--    patchRL :: RLProxy rl -> RLProxy dl -> Record r -> Record d -> Record r
--
--  instance patchRLNil :: PatchRL () Nil () Nil where
--    patchRL _ _ _ _ = {}
--
--  instance patchRLCons
--      :: ( IsSymbol l
--         , Patch a m
--         , PatchRL r1 rl d1 dl
--         , Row.Cons l a r1 r2
--         , Row.Cons l m d1 d2
--         , Row.Lacks l r1
--         , Row.Lacks l d1
--         )
--      => PatchRL r2 (Cons l a rl) d2 (Cons l m dl) where
--    patchRL _ _ x y =
--      x

foreign import cloneRecord ::
  ∀ r. Record r -> Record r

foreign import patchOneRecordEntry ::
  ∀ a b r. String -> (a -> b) -> Record r -> Record r

foreign import data ChangeEntry :: Type

foreign import unsafePatchRecord ::
  ∀ r p. Record r -> Array { key :: String, patch :: p } -> Record r

foreign import parseChanges ::
  ∀ r c. Record r -> Array { key :: String, change :: c }

-- ===============================================
-- ===============================================
-- ===============================================

newtype Change a da = Change { delta :: da, patch :: (a -> da -> a) }

atomicUpdate :: ∀ a. a -> Change (Atomic a) (AtomicUpdate a)
atomicUpdate newVal =
  Change { delta: AtomicUpdate newVal
         , patch: (\_ _ -> Atomic newVal)
         }

patch :: ∀ a da. a -> Change a da -> a
patch oldVal (Change { delta, patch: p }) = p oldVal delta

-- newtype RecordUpdate r = RecordUpdate (Record r)

-- class ChangeRL (rl :: RowList) (dl :: RowList)
class ChangeRL (r :: # Type ) (rl :: RowList) (d :: # Type) (dl :: RowList) | rl -> r, dl -> d, dl -> rl

-- instance changeRLNil :: ChangeRL Nil Nil

-- instance changeRLCons
--   :: ( IsSymbol l
--      , ChangeRL r d
--      )
--   => ChangeRL (RL.Cons l a r) (RL.Cons l (Change a da) d)
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
--else instance changeRLNil :: ChangeRL r rl () Nil

recordChange2
  :: ∀ r rl d dl
  . RL.RowToList r rl
 => RL.RowToList d dl
 => ChangeRL r rl d dl
 => Record d -> Record d
recordChange2 rd =
  rd

recordChange
  :: ∀ r rl d dl
  . RL.RowToList r rl
 => RL.RowToList d dl
 => ChangeRL r rl d dl
 => Record d -> Change (Record r) (Record d)
recordChange rd =
  Change { delta: rd
         , patch: (\r _ -> r)
         }


-- instance patchRLNil :: PatchRL () Nil () Nil where
--   patchRL _ _ _ _ = {}
--
-- instance patchRLCons
--     :: ( IsSymbol l
--        , Patchable a m
--        , PatchRL r1 rl d1 dl
--        , Row.Cons l a r1 r2
--        , Row.Cons l m d1 d2
--        , Row.Lacks l r1
--        , Row.Lacks l d1
--        )
--     => PatchRL r2 (Cons l a rl) d2 (Cons l m dl) where
--   patchRL _ _ x y =
--     x
--

-- ===============================================
-- ===============================================
-- ===============================================

type F =
  { foo :: Atomic String
  , bar :: Atomic String
  , baz :: Atomic String
  }

--
rec1 :: F
rec1 =
  { foo: Atomic "Foo"
  , bar: Atomic "Bar"
  , baz: Atomic "Baz"
  }

rec2 :: F
rec2 = patch rec1 recChange

-- recChange :: ∀ df. Change F df
-- recChange :: ∀ df. Change F df
-- recChange ::
--   Change F { foo :: Change (Atomic String) (AtomicUpdate String)
--            , bar :: Change (Atomic String) (AtomicUpdate String)
--            -- , baz :: Change (Atomic String) (AtomicUpdate String)
--            }
recChange =
  recordChange { foo: atomicUpdate "FOOFOO"
               , bar: atomicUpdate "BARBAR"
               -- , baz: atomicUpdate "BARBAR"
               }


foo :: Atomic String
foo = Atomic "foo"

bar :: Atomic String
bar = patch foo (atomicUpdate "bar")
