module Alchemy.FRP.RV
  where

import Prelude

import Alchemy.Data.Incremental.Types (Change)
import Alchemy.Debug (debugLog)
import Alchemy.FRP.Event (Event(..), Sender, shareWhen)
import Alchemy.FRP.Event (subscribe) as Ev
import Alchemy.FRP.Subscription (Subscription)
import Data.Array (deleteBy)
import Data.Foldable (traverse_)
import Data.Maybe (Maybe(..), fromJust)
import Effect (Effect)
import Effect.Ref as Ref
import Effect.Unsafe (unsafePerformEffect)
import Partial.Unsafe (unsafePartial)
import Unsafe.Reference (unsafeRefEq)


-- -- | A reactive value represents a value with discrete changes over time
-- newtype RV i o = RV (Effect { i :: Sender i, o :: Event o, v :: Effect o })
newtype RV a =
  RV (a -> Effect { update :: Change a -> Effect Unit })

newtype Signal s a = Signal { here :: s, view :: s -> a }

-- -- derive instance functorRV :: Functor RV
-- --
-- -- instance applyRV :: Apply RV where
-- --   apply (RV ef) (RV ea) = RV (ef <*> ea)
-- --
-- -- instance applicativeRV :: Applicative RV where
-- --   pure a = RV (pure a)
--
-- create :: ∀ i o.
--   (i -> Maybe o) -> o -> Effect { send :: Sender i, rv :: RV i o}
-- create f o = do
--   rv <- make f o
--   pure { send: rv.i, rv: RV (pure rv) }
--
--
-- make :: ∀ i o.
--   (i -> Maybe o) -> o -> Effect { i :: Sender i, o :: Event o, v :: Effect o }
-- make f o = do
--   subscribers <- Ref.new []
--   last <- Ref.new o
--   pure $
--     -- IN :: Sender i
--     { i: \i ->
--       case f i of
--         Nothing -> pure unit
--         Just o' -> do
--           Ref.write o' last
--           Ref.read subscribers >>= traverse_ \k -> k o'
--
--     -- OUT :: Event o
--     , o: Event \k -> do
--       _ <- Ref.modify (_ <> [k]) subscribers
--       Ref.read last >>= k
--
--       pure do
--         _ <- Ref.modify (deleteBy unsafeRefEq k) subscribers
--         pure unit
--
--     -- current value
--     , v: Ref.read last
--     }
--
--
-- -- | Reads the current value
-- get :: ∀ i o. RV i o -> Effect o
-- get (RV eff ) = eff >>= _.v
--
--
-- map :: ∀ i a b. (a -> b) -> RV i a -> RV i b
-- map f (RV createRV) = RV do
--   rva <- createRV
--   a0 <- rva.v
--   out <- shareWhen (\s a -> s (f a)) rva.o
--
--   pure { i: rva.i
--        , o: out
--        , v: f <$> rva.v
--        }
--
-- -- -- | The (future) outgoing values
-- -- values :: ∀ i o. RV i o -> Event o
-- -- values (RV eff) = do
-- --   reactiveValue <- eff
-- --   reactiveValue.o

