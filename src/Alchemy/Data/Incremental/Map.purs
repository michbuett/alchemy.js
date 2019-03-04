module Alchemy.Data.Increment.SimpleMap
  where

foreign import data SMap :: Type -> Type

-- data SMapChange a
--   = InsertAt String a
--   | RemoveAt String
--   | UpdateAt String (Change a)

-- empty :: ∀ a. SMap a
--
-- insertAt :: ∀ a. String -> a -> Patch (SMap a)
--
-- removeAt :: ∀ a. String -> Patch (SMap a)
--
-- updateAt :: ∀ a. String -> Patch a -> Patch (SMap a)
--
-- assign :: SMap (Patch a) -> Patch (SMap a)
