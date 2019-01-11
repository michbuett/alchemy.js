module Alchemy.Data.Incremental.Types
  ( class Patchable
  , class PatchableRecordRL
  , ArrayUpdate(..)
  , AtomicUpdate(..)
  , Change
  , fromChange
  , toChange
  , mapChange
  ) where

import Prelude

import Data.Maybe (Maybe)
import Data.Symbol (class IsSymbol)
import Prim.Row as Row
import Prim.RowList as RL
import Type.Row (Nil, kind RowList)
import Unsafe.Coerce (unsafeCoerce)

-- | A type class to connect a type with its change structure
-- | This allows the type checker to infere the type of the change da
-- | for a given type a
class Patchable a da | a -> da

instance patchableInt :: Patchable Int (AtomicUpdate Int)
instance patchableNumber :: Patchable Number (AtomicUpdate Number)
instance patchableBoolean :: Patchable Boolean (AtomicUpdate Boolean)
instance patchableString :: Patchable String (AtomicUpdate String)

instance patchableRecord ::
  ( RL.RowToList r rl
  , RL.RowToList d dl
  , PatchableRecordRL r rl d dl
  ) => Patchable (Record r) (Record d)

instance patchableArrayUpdate ::
  (Patchable a da) => Patchable (Array a) (Array (ArrayUpdate a))

data AtomicUpdate a = Replace a a

instance functorAtomicUpdate :: Functor AtomicUpdate where
  map f (Replace a b) = Replace (f a) (f b)

instance showAtomicUpdate :: Show a => Show (AtomicUpdate a) where
  show (Replace x y) =
    "Replace('" <> show x <> "' => '" <> show y <> "')"

instance eqAtomicUpdate :: Eq a => Eq (AtomicUpdate a) where
  eq (Replace x1 y1) (Replace x2 y2) = eq x1 x2 && eq y1 y2

instance semigroupAtomicUpdate :: Semigroup (AtomicUpdate a) where
  append (Replace x _) (Replace _ y) = Replace x y


class PatchableRecordRL (r :: # Type) (rl :: RowList) (d :: # Type) (dl :: RowList)
         | rl -> dl, dl -> d, rl -> r

instance patchableRecordRLNil :: PatchableRecordRL () Nil () Nil

instance patchableRecordRLCons
  :: ( IsSymbol l
     , PatchableRecordRL r1 rl d1 dl
     , Row.Cons l a r1 r2
     , Row.Cons l (Maybe (Change a)) d1 d2
     -- , Patchable a da
     , Row.Lacks l r1
     , Row.Lacks l d1
     )
  => PatchableRecordRL r2 (RL.Cons l a rl) d2 (RL.Cons l (Maybe (Change a)) dl)

-- data ArrayUpdate a da
--   = InsertAt Int a
--   | DeleteAt Int
--   | UpdateAt Int da
--
-- derive instance eqArrayUpdate :: (Eq a, Eq da) => Eq (ArrayUpdate a da)
--
-- instance showArrayUpdate :: (Show a, Show da) => Show (ArrayUpdate a da) where
--   show (InsertAt i v) = "InsertAt(" <> (show i) <> ", " <> (show v) <> ")"
--   show (DeleteAt i) = "DeleteAt(" <> (show i) <> ")"
--   show (UpdateAt i v) = "UpdateAt(" <> (show i) <> ", " <> (show  v) <> ")"
data ArrayUpdate a
  = InsertAt Int a
  | DeleteAt Int
  | UpdateAt Int (Change a)

derive instance eqArrayUpdate ::
  (Patchable a da, Eq a, Eq da) => Eq (ArrayUpdate a)

instance showArrayUpdate ::
  (Patchable a da, Show a, Show da) => Show (ArrayUpdate a) where
  show (InsertAt i v) = "InsertAt(" <> (show i) <> ", " <> (show v) <> ")"
  show (DeleteAt i) = "DeleteAt(" <> (show i) <> ")"
  show (UpdateAt i v) = "UpdateAt(" <> (show i) <> ", " <> (show  v) <> ")"


-- | A type level function which maps a type to the type of its change structure
-- |
-- | Uniqueness of instances makes the coercions `fromChange` and `toChange`
-- | safe, since the functional dependency makes the change structure type
-- | unique.
data Change a

instance showChange :: (Patchable a da, Show da) => Show (Change a) where
  show = show <<< fromChange

instance eqChange :: (Patchable a da, Eq da) => Eq (Change a) where
  eq c1 c2 = eq (fromChange c1) (fromChange c2)

instance semigroupChange :: (Patchable a da, Semigroup da) => Semigroup (Change a) where
  append x y = toChange (fromChange x <> fromChange y)

instance monoidChange :: (Patchable a da, Monoid da) => Monoid (Change a) where
  mempty = toChange mempty

-- newtype Delta f a = Delta (Patchable a (f a) => f a)
--
-- instance functorDelta ::
--   ( Functor f
--   , Patchable a (f a)
--   , Patchable b (f b)
--   ) => Functor (Delta f) where
--     -- map :: (a -> b) -> Delta f a -> Delta f b
--     map f (Delta c) =
--       let fa = c :: f a
--        in unsafeCoerce c

-- instance functorChange :: Functor Change where
instance functorChange ::
  ( Functor f
  , Patchable a da
  , Patchable b (f b)
  )
  => Functor Change where
  -- map :: ∀ a da b. Patchable a da => (a -> b) -> Change a -> Change b
  map f c =
    -- let d :: da
    --     d = fromChange c
    --  in
    unsafeCoerce f
  -- map :: Functor f => Patchable a (f a) => Patchable b (f b)
  -- map :: ∀ a b f. Functor f => Patchable a (f a) => Patchable b (f b)
    -- => (a -> b) -> Change a -> Change b
  -- map :: (a -> b) -> Change a -> Change b
  -- map = mapChange
  -- map f ca =
    -- toChange (f <$> (fromChange ca))
-- instance functorChange ::  (Patchable a (f a), Patchable b (f b)) => Functor Change where
  -- map :: ∀ a b. (a -> b) -> Change (a) -> Change (b)
  -- map f ca =
    -- let da :: f a
    --     da = fromChange ca
    --  in
     -- unsafeCoerce f
    -- toChange (f <$> (fromChange ca))

mapChange :: ∀ a b f
  . Functor f
 => Patchable a (f a)
 => Patchable b (f b)
 => (a -> b) -> Change a -> Change b
mapChange f ca =
  toChange (f <$> (fromChange ca))

fromChange :: forall a da. Patchable a da => Change a -> da
fromChange = unsafeCoerce

toChange :: forall a da. Patchable a da => da -> Change a
toChange = unsafeCoerce
