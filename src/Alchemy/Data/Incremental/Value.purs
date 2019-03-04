module Alchemy.Data.Increment.Value
  where

import Prelude hiding (map)

import Alchemy.Data.Incremental (Increment, liftValue)
import Alchemy.Data.Incremental.Types (Change)
import Data.Maybe (Maybe(..))


-- newtype IVal delta val =
--   IVal { inc :: Increment val
--        , next :: delta -> IVal delta val
--        }
--
--
-- constant :: ∀ a d. a -> IVal d a
-- constant a =
--   IVal { inc: liftValue a, next: \_ -> constant a }
--
--
-- lift :: ∀ a. a -> IVal (Increment a) a
-- lift a0 =
--   create (\ia _ -> ia) a0
--
--
-- create :: ∀ a d. (d -> a -> Increment a) -> a -> IVal d a
-- create f a0 =
--   IVal { inc: liftValue a0, next: createNext a0 }
--   where
--     createNext a d = IVal { inc: f d a, next: createNext a }
--
--
-- create' :: ∀ a b. (Increment a -> Increment b) -> a -> IVal (Increment a) b
-- create' f =
--   map f <<< lift
--
--
-- map :: ∀ a b d. (Increment a -> Increment b) -> IVal d a -> IVal d b
-- map f (IVal { inc: i, next: n }) =
--   IVal { inc: f i, next: map f <<< n }
--
--
-- -- | The contravariant map that allows to change the deltas which you can feed
-- -- | into the incremental value
-- cmap :: ∀ a da db. (db -> da) -> IVal da a -> IVal db a
-- cmap f (IVal { inc, next: n }) =
--   IVal { inc, next: \db -> cmap f $ n (f db) }
--
--
-- value :: ∀ a d. IVal d a -> a
-- value (IVal { inc }) = inc.new
--
--
-- delta :: ∀ a d. IVal d a -> Maybe (Change a)
-- delta (IVal { inc }) = inc.delta
--
--
-- next :: ∀ a d. d -> IVal d a -> IVal d a
-- next d (IVal { next: f }) = f d


newtype IVal delta val =
  IVal { inc :: Increment val
       , next :: Increment delta -> IVal delta val
       }


constant :: ∀ a d. a -> IVal d a
constant a =
  IVal { inc: liftValue a, next: \_ -> constant a }


lift :: ∀ a. a -> IVal a a
lift a0 =
  fold (\ia _ -> ia) a0


-- fromPatch :: ∀ a d. (d -> Patch a) -> a -> IVal d a
-- fromPatch f a0 =


fold:: ∀ a d. (Increment d -> Increment a -> Increment a) -> a -> IVal d a
fold f a0 =
  let ia0 = liftValue a0 in
  IVal { inc: ia0, next: createNext ia0 }
  where
    createNext a { delta: Nothing } = IVal { inc: a, next: createNext a }
    createNext a d = IVal { inc: f d a, next: createNext a }


map :: ∀ a b d. (Increment a -> Increment b) -> IVal d a -> IVal d b
map f (IVal { inc: i, next: n }) =
  IVal { inc: f i, next: map f <<< n }


-- | The contravariant map that allows to change the deltas which you can feed
-- | into the incremental value
cmap :: ∀ a da db. (Increment db -> Increment da) -> IVal da a -> IVal db a
cmap f (IVal { inc, next: n }) =
  IVal { inc, next: \db -> cmap f $ n (f db) }


increment :: ∀ a d. IVal d a -> Increment a
increment (IVal { inc }) = inc


value :: ∀ a d. IVal d a -> a
value = increment >>> _.new


delta :: ∀ a d. IVal d a -> Maybe (Change a)
delta = increment >>> _.delta


next :: ∀ a d. Increment d -> IVal d a -> IVal d a
next { delta: Nothing } iv = iv
next d (IVal { next: f }) = f d
