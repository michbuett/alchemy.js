module Alchemy.Data.Incremental
  where


import Prelude
import Alchemy.Data.Incremental.Types (class Patchable, Change)
import Data.Maybe (Maybe(..))

-- | A patch is a thing where you can feed a value in and get a new value
-- | paired witch the respectable changes
newtype Patch a = Patch (a -> Increment a)

instance semigroupPatch :: (Patchable a da, Semigroup da) => Semigroup (Patch a) where
  append (Patch f) (Patch g) =
    Patch \a ->
      let fa = f a
          ga = g fa.new
       in { new: ga.new, delta: fa.delta <> ga.delta }


mapP :: ∀ a b. (b -> a) -> (Increment a -> Increment b) -> Patch a -> Patch b
mapP unwrap wrap (Patch p) =
  Patch (unwrap >>> p >>> wrap)


type Increment a =
  { new :: a
  , delta :: Maybe (Change a)
  }

-- | Create a new value based on a given change
runPatch :: ∀ a. Patch a -> a -> Increment a
runPatch (Patch p) = p

-- | DEPRECATED
patch :: ∀ a. Patch a -> a -> Increment a
patch = runPatch

-- | A patch that does nothing
noop :: ∀ a. Patch a
noop = Patch (\x -> { new: x, delta: Nothing })

-- | A patch that allways produces a predefined increment
const :: ∀ a. Increment a -> Patch a
const i = Patch (\_ -> i)
