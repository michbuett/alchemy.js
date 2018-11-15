module Alchemy.Data.Incremental.Atomic
   ( Atomic(..)
   , AtomicUpdate(..)
   , IAtomic
   , atomic
   , setValue
   ) where

import Prelude

import Alchemy.Data.Incremental (IValue(..), Increment)
import Data.Maybe (Maybe(..))
import Data.Newtype (class Newtype)


type IAtomic a = IValue (Atomic a) (AtomicUpdate a)


newtype Atomic a = Atomic a

data AtomicUpdate a = Replace (Maybe a) a

derive instance eqAtomic :: Eq a => Eq (Atomic a)
derive instance ordAtomic :: Ord a => Ord (Atomic a)
derive instance newtypeAtomic :: Newtype (Atomic a) _


instance showAtomic :: Show a => Show (Atomic a) where
  show (Atomic a) = "Atomic(" <> show a <> ")"


instance showAtomicUpdate :: Show a => Show (AtomicUpdate a) where
  show (Replace (Just x) y) =
    "Replace('" <> show x <> "' => '" <> show y <> "')"
  show (Replace Nothing x) =
    "Replace(NOTHING => '" <> show x <> "')"


instance eqAtomicUpdate :: Eq a => Eq (AtomicUpdate a) where
  eq (Replace (Just x1) y1) (Replace (Just x2) y2) = eq x1 x2 && eq y1 y2
  eq (Replace Nothing y1) (Replace Nothing y2) = eq y1 y2
  eq _ _ = false


atomic :: ∀ a. a -> IAtomic a
atomic x =
  IValue $ { value: Atomic x
           , patch: patchAtomic x
           }


setValue :: ∀ a. a -> AtomicUpdate a
setValue = Replace Nothing


patchAtomic ::
  ∀ a. a -> AtomicUpdate a -> Increment (Atomic a) (AtomicUpdate a)
patchAtomic oldVal (Replace _ newVal) =
  { new: atomic newVal
  , delta: Replace (Just oldVal) newVal
  }
