module Alchemy.Data.Incremental
  ( noop
  , const
  , liftValue
  , module Types
  ) where


import Alchemy.Data.Incremental.Types (Patch(..), Increment)
import Alchemy.Data.Incremental.Types (class Patchable, class PatchableRecordRL, ArrayUpdate(..), AtomicUpdate(..), Change, Increment, Patch(..), fromChange, mapChange, runPatch, toChange) as Types
import Data.Maybe (Maybe(..))


-- | A patch that does nothing
noop :: ∀ a. Patch a
noop = Patch liftValue


-- | A patch that allways produces a predefined increment
const :: ∀ a. Increment a -> Patch a
const i = Patch \_ -> i


liftValue :: ∀ a. a -> Increment a
liftValue x = { new: x, delta: Nothing }
