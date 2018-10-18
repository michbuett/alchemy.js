module Alchemy.Data.Incremental
   ( IValue(..)
   , patch
   , value
   ) where

import Prelude



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
