module Alchemy.Data.Incremental
  ( Patch(..)
  , Increment
  , patch
  , noop
  ) where


import Alchemy.Data.Incremental.Types (Change)
import Data.Maybe (Maybe(..))

-- | A patch is a thing where you can feed a value in and get a new value
-- | paired witch the respectable changes
newtype Patch a = Patch (a -> Increment a)

type Increment a =
  { new :: a
  , delta :: Maybe (Change a)
  }

-- | Create a new value based on a given change
patch :: ∀ a. Patch a -> a -> Increment a
patch (Patch runPatch) = runPatch

-- | A patch that does nothing
noop :: ∀ a. Patch a
noop = Patch (\x -> { new: x, delta: Nothing })
