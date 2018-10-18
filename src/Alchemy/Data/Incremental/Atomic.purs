module Alchemy.Data.Incremental.Atomic
   ( Atomic(..)
   , IAtomic
   , atomic
   ) where

import Prelude

import Alchemy.Data.Incremental (IValue(..))
import Data.Newtype (class Newtype)


type IAtomic a = IValue (Atomic a) a


newtype Atomic a = Atomic a

derive instance eqAtomic :: Eq a => Eq (Atomic a)
derive instance ordAtomic :: Ord a => Ord (Atomic a)
derive instance newtypeAtomic :: Newtype (Atomic a) _


instance showAtomic :: Show a => Show (Atomic a) where
  show (Atomic a) = "Atomic(" <> show a <> ")"


atomic :: ∀ a. a -> IAtomic a
atomic x =
  IValue $ { value: Atomic x
           , patch: atomic
           }
