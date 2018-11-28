module Alchemy.Data.Incremental.Atomic
   ( Atomic(..)
   , set
   , modify
   , replaceWith
   ) where

import Prelude

import Alchemy.Data.Incremental (Increment, Patch(..))
import Alchemy.Data.Incremental.Types (class Patchable, AtomicUpdate(..), toChange)
import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype)

-- | A value which is replace as a whole
newtype Atomic a = Atomic a

derive instance eqAtomic :: Eq a => Eq (Atomic a)
derive instance ordAtomic :: Ord a => Ord (Atomic a)
derive instance newtypeAtomic :: Newtype (Atomic a) _

instance showAtomic :: Show a => Show (Atomic a) where
  show (Atomic a) = show a

instance patchableAtomic ::
  Patchable (Atomic a) (AtomicUpdate (Atomic a))

set :: ∀ a. Eq a => Patchable a (AtomicUpdate a) => a -> Patch a
set newVal = Patch (replaceWith newVal)

modify :: ∀ a. Eq a => Patchable a (AtomicUpdate a) => (a -> a) -> Patch a
modify f = Patch (\a -> replaceWith (f a) a)

replaceWith :: ∀ a. Eq a => Patchable a (AtomicUpdate a) => a -> a -> Increment a
replaceWith newVal oldVal =
  if oldVal == newVal
    then { new: newVal, delta: Nothing }
    else { new: newVal, delta: Just $ toChange (Replace oldVal newVal) }
