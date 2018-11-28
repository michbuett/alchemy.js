module Alchemy.Data.Incremental.Array
   ( cons
   , snoc
   , uncons
   , unsnoc
   , updateAt
   ) where

import Prelude

import Alchemy.Data.Incremental (Increment, Patch(..))
import Alchemy.Data.Incremental.Types (class Patchable, ArrayUpdate(..), fromChange, toChange)
import Data.Array as Array
import Data.Maybe (Maybe(..), fromJust)
import Partial.Unsafe (unsafePartial)
-- import Unsafe.Coerce (unsafeCoerce)


--newtype ArrayChange a da = ArrayChange (Array (ArrayUpdate a da))
--
--instance showArrayChange :: (Show a, Show da) => Show (ArrayChange a da) where
--  show (ArrayChange a) = show a
--
--instance eqArrayChange :: (Eq a, Eq da) => Eq (ArrayChange a da) where
--  eq (ArrayChange a) (ArrayChange b) = eq a b
--



-- data ArrayChange a
-- newtype ArrayChange a = ArrayChange (Array (ArrayUpdate a))
-- newtype ArrayChange a da = ArrayChange (Array (ArrayUpdate a da))

-- toArrayChange:: ∀ a da. Patchable a da => Array (ArrayUpdate a da) -> Change (Array a)
-- toArrayChange = unsafeCoerce
--
-- fromArrayChange:: ∀ a da. Patchable a da => Change (Array a) -> Array (ArrayUpdate a da)
-- fromArrayChange = unsafeCoerce
-- fromArrayChange = unsafeCoerce

-- toArrayChange :: ∀ a da
--   . Patchable a da
--  => (Array (ArrayUpdate a da))
--  -> Change (Array a)
-- toArrayChange da =
--   toChange (ArrayChange da)
--
-- toArrayChange da =
--   toChange (ArrayChange da)


-- instance showArrayChange :: (Patchable a da, Show a) => Show (ArrayChange a) where
--   show (ArrayChange a) = show a
--   -- show a = show (fromArrayChange a)
--
-- instance eqArrayChange :: (Eq a) => Eq (ArrayChange a) where
--   -- eq a b = eq (fromArrayChange a) (fromArrayChange b)
--   eq (ArrayChange a) (ArrayChange b) = eq a b
--
-- data ArrayUpdate a da
--   = InsertAt Int a
--   | DeleteAt Int
--   | UpdateAt Int da
-- data ArrayUpdate a
--   = InsertAt Int a
--   | DeleteAt Int
--   | UpdateAt Int (Change a)

-- instance eqArrayUpdate :: (Eq a, Eq da) => Eq (ArrayUpdate a) where
-- instance eqArrayUpdate :: (Eq a, Eq da) => Eq (ArrayUpdate a da) where
--   eq (InsertAt i1 v1) (InsertAt i2 v2) = i1 == i2 && (eq v1 v2)
--   eq (DeleteAt i1) (DeleteAt i2) = i1 == i2
--   eq (UpdateAt i1 v1) (UpdateAt i2 v2) = i1 == i2 && (eq v1 v2)
--   eq _ _ = false
--
-- -- instance showArrayUpdate :: (Patchable a da, Show a, Show da) => Show (ArrayUpdate a) where
-- instance showArrayUpdate :: (Show a, Show da) => Show (ArrayUpdate a da) where
--   show (InsertAt i v) = "InsertAt(" <> (show i) <> ", " <> (show v) <> ")"
--   show (DeleteAt i) = "DeleteAt(" <> (show i) <> ")"
--   show (UpdateAt i v) = "UpdateAt(" <> (show i) <> ", " <> (show  v) <> ")"
--   -- show (UpdateAt i v) = "UpdateAt(" <> (show i) <> ", " <> (show (fromChange v :: da)) <> ")"


-- newtype IArray a = IArray (Array a)
--
-- derive instance eqIArray :: Eq a => Eq (IArray a)
--
-- instance showIArray :: Show a => Show (IArray a) where
--   show (IArray xs) = "(IArray " <> show xs <> ")"
--
-- -- type PArray a da = Patch (Arra-- y (ArrayUpdate a da)) (Array a) (Array a)
--
--
-- instance patchableArrayUpdate ::
--   (Patchable a da) => Patchable (Array a) (ArrayChange a da)
-- instance patchableArrayUpdate :: Patchable (Array a) (ArrayChange a)
-- instance patchableArrayUpdate :: Patchable (IArray a) (Array (ArrayUpdate a))

-- | Attaches an element to the front of an array, creating a new array.
cons :: ∀ a da. Patchable a da => a -> Patch (Array a)
cons newItem = Patch runPatch
  where
    runPatch arr =
      { new: Array.cons newItem arr
      , delta: Just $ toChange [InsertAt 0 newItem]
      }

-- | Append an element to the end of an array, creating a new array.
snoc :: ∀ a da. Patchable a da => a -> Patch (Array a)
snoc newItem = Patch runPatch
  where
  runPatch arr =
    { new: Array.snoc arr newItem
    , delta: Just $ toChange [InsertAt (Array.length arr) newItem]
    }


-- uncons :: ∀ a da. PArray a da
uncons :: ∀ a da. Patchable a da => Patch (Array a)
uncons = Patch runPatch
  where
  runPatch arr =
    case Array.uncons arr of
      Nothing ->
        { new: arr, delta: Nothing }
      Just { tail } ->
        { new: tail, delta: Just $ (toChange [DeleteAt 0]) }

unsnoc :: ∀ a da. Patchable a da => Patch (Array a)
unsnoc = Patch runPatch
  where
  runPatch arr =
    case Array.unsnoc arr of
      Nothing ->
        { new: arr, delta: Nothing }
      Just { init } ->
        { new: init, delta: Just $ toChange [DeleteAt $ Array.length init] }

updateAt :: ∀ a da. Patchable a da => Int -> (a -> Increment a) -> Patch (Array a)
updateAt i f = Patch runPatch
  where
  runPatch arr =
    case Array.index arr i of
      Nothing -> { new: arr, delta: Nothing }
      Just x ->
        case f x :: Increment a of
          { delta: Nothing } -> { new: arr, delta: Nothing }
          { new, delta: Just dx } ->
            { new: unsafePartial fromJust (Array.updateAt i new arr)
            , delta: Just $ toChange [ UpdateAt i dx ]
            -- , delta: Just $ toChange [ UpdateAt i (fromChange dx) ]
            }
