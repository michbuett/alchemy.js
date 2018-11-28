module Alchemy.FRP.Event
  ( Channel
  , Event
  , Sender
  , openChannel
  , multiplex
  , multiplex_
  , subscribe
  , foldp
  , send
  , filter
  -- , dropRepeats
  -- , dropRepeats'
  , switcher
  ) where

import Prelude

import Alchemy.FRP.Subscription (Subscription)
import Data.Array (deleteBy)
import Data.Foldable (traverse_)
import Data.Function.Uncurried (Fn2, runFn2)
import Data.Maybe (Maybe(..))
import Effect (Effect)
import Effect.Ref as Ref

type Channel i o = { sender :: Sender i, event :: Event o }

newtype Event a = Event ((a -> Effect Unit) -> Effect (Effect Unit))

type Sender a = (a -> Effect Unit)

instance mapEvent :: Functor Event where
  map f (Event e) = Event \s -> e (\a -> s (f a))

instance applyEvent :: Apply Event where
  apply (Event e1) (Event e2) = Event \k -> do
    latestA <- Ref.new Nothing
    latestB <- Ref.new Nothing
    c1 <- e1 \a -> do
      Ref.write (Just a) latestA
      Ref.read latestB >>= traverse_ (k <<< a)
    c2 <- e2 \b -> do
      Ref.write (Just b) latestB
      Ref.read latestA >>= traverse_ (k <<< (_ $ b))
    pure (c1 *> c2)

instance applicativeEvent :: Applicative Event where
  pure a = Event subscr
    where
      subscr handler = do
         _ <- handler a
         pure (pure unit)

subscribe :: ∀ a r. Event a → (a → Effect r) → Subscription
subscribe (Event e) k = e (void <<< k)

foreign import unsafeRefEq :: ∀ a. a -> a -> Boolean

-- | Create an event and a function which supplies a value to that event.
foreign import openChannel ::
  ∀ a. Effect (Channel a a)
-- openChannel ::
--   ∀ a. Effect (Channel a a)
-- openChannel = do
--   subscribers <- Ref.new []
--   pure
--     { event: Event \k -> do
--         _ <- Ref.modify (_ <> [k]) subscribers
--         pure do
--           _ <- Ref.modify (deleteBy unsafeRefEq k) subscribers
--           pure unit
--
--     , sender: \a -> do
--         Ref.read subscribers >>= traverse_ \k -> k a
--     }

multiplex_ :: ∀ a. Event a -> Event a
multiplex_ = multiplex (\s v -> send s v)

multiplex :: ∀ a b. (Sender b -> a -> Effect Unit) -> Event a -> Event b
multiplex = runFn2 multiplexImpl

foreign import multiplexImpl ::
  ∀ a b. Fn2 (Sender b -> a -> Effect Unit) (Event a) (Event b)

foldp ::
  ∀ a b. Show a => Show b => (a -> b -> b) -> b -> Event a -> Event b
foldp f b (Event e) =
  Event \s -> do
    r <- Ref.new b
    e (\a -> Ref.modify (f a) r >>= s)


send :: ∀ a. Sender a -> a -> Effect Unit
send s = s

filter :: forall a. (a -> Boolean) -> Event a -> Event a
filter p (Event e) = Event \k -> e \a -> if p a then k a else pure unit

-- foreign import dropRepeats ::
--   ∀ a. Eq a => Event a -> Event a
--
-- foreign import dropRepeats' ::
--   ∀ a. Event a -> Event a

foreign import switcher ::
  ∀ a. (a → Subscription) → Event a → Subscription
