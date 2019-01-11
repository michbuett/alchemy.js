module Alchemy.FRP.RV
  where

import Prelude

import Alchemy.Debug (debugLog)
import Alchemy.FRP.Event (Event(..), Sender)
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


-- | A reactive value represents a value with discrete changes over time
newtype RV i o = RV ({ i :: Sender i, o :: Event o, v :: Effect o })

-- derive instance functorRV :: Functor RV
--
-- instance applyRV :: Apply RV where
--   apply (RV ef) (RV ea) = RV (ef <*> ea)
--
-- instance applicativeRV :: Applicative RV where
--   pure a = RV (pure a)


create :: ∀ i o. (i -> Maybe o) -> o -> Effect (RV i o)
create f o = do
  subscribers <- Ref.new []
  last <- Ref.new o
  pure $ RV
    -- IN :: Sender i
    { i: \i ->
      case f i of
        Nothing -> pure unit
        Just o' -> do
          Ref.write o' last
          Ref.read subscribers >>= traverse_ \k -> k o'

    -- OUT :: Event o
    , o: Event \k -> do
      _ <- Ref.modify (_ <> [k]) subscribers
      Ref.read last >>= k

      pure do
        _ <- Ref.modify (deleteBy unsafeRefEq k) subscribers
        pure unit

    -- current value
    , v: Ref.read last
    }


-- | Reads the current value
get :: ∀ i o. RV i o -> Effect o
get (RV { v } ) = v

-- | Feeds a new value in
set :: ∀ i o. RV i o -> i -> Effect Unit
set (RV { i }) = i

-- | The (future) outgoing values
values :: ∀ i o. RV i o -> Event o
values (RV { o }) = o

compose :: ∀ a b c. RV b c -> RV a b -> RV a c
compose g f =
  RV { i: \a -> do
            set f a
            b <- get f
            set g b

     , o: values g
     , v: get g
     }


newtype CB i o = CB (Sender o -> Sender i)
  -- (o -> Effect Unit) -> i -> Effect Unit

make :: ∀ i o. (i -> Sender o -> Effect Unit) -> CB i o
make f =
  CB \send i -> f i send

run :: ∀ i o. CB i o -> (o -> Effect Unit) -> i -> Effect Unit
run (CB f) = f


type State =
  { foo :: String
  , bar :: Int
  }

render :: State -> Effect Unit
render _ = pure unit

div :: String -> Effect Unit
div s = debugLog $ "render div " <> s
