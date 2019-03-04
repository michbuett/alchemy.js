module Alchemy.Data.Incremental.Atomic
   ( Atomic(..)
   , modify
   , replace
   , old
   , new
   , map
   , ival
   ) where

import Prelude

import Alchemy.Data.Increment.Value (IVal, fold)
import Alchemy.Data.Incremental (Increment, Patch(..))
import Alchemy.Data.Incremental.Types (class Patchable, AtomicUpdate(..), Change, fromChange, toChange)
import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype)

-- | A value which is replace as a whole
newtype Atomic a = Atomic a

derive instance eqAtomic :: Eq a => Eq (Atomic a)
derive instance ordAtomic :: Ord a => Ord (Atomic a)
derive instance newtypeAtomic :: Newtype (Atomic a) _
derive instance functorAtomic :: Functor Atomic

instance showAtomic :: Show a => Show (Atomic a) where
  show (Atomic a) = show a

instance patchableAtomic ::
  Patchable (Atomic a) (AtomicUpdate (Atomic a))


modify :: ∀ a. Eq a => Patchable a (AtomicUpdate a) => (a -> a) -> Patch a
modify f =
  Patch \a -> replace (f a) a


set :: ∀ a. Eq a => Patchable a (AtomicUpdate a) => a -> Patch a
set newVal =
  Patch $ replace newVal


replace :: ∀ a. Eq a => Patchable a (AtomicUpdate a) => a -> a -> Increment a
replace newVal oldVal =
  if oldVal == newVal
    then { new: newVal, delta: Nothing }
    else { new: newVal, delta: Just $ toChange (Replace oldVal newVal) }


old :: ∀ a. Patchable a (AtomicUpdate a) => Change a -> a
old da = let Replace a _ = fromChange da in a


new :: ∀ a. Patchable a (AtomicUpdate a) => Change a -> a
new da = let Replace _ a = fromChange da in a


map :: ∀ a b
  . Patchable a (AtomicUpdate a)
 => Patchable b (AtomicUpdate b)
 => Eq b
 => (a -> b)
 -> Increment a
 -> Increment b
map f { new: a, delta: Nothing } = { new: f a, delta: Nothing }
map f { delta: Just da } =
  let Replace old new = fromChange da
   in replace (f new) (f old)


ival :: ∀ a b
  . Patchable b (AtomicUpdate b)
 => Eq b
 => (a -> b)
 -> a
 -> IVal a b
ival f a0 =
  fold runPatch (f a0)
  where
    runPatch { delta: Nothing } last = { new: last.new, delta: Nothing }
    runPatch { new: a } last = replace (f a) last.new
