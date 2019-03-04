module Alchemy.FRP.Event
  ( Channel
  , Event(..)
  , Sender
  , openChannel
  , subscribe
  , foldp
  , filter
  , switch
  , share
  , shareWhen
  ) where

import Prelude

import Alchemy.FRP.Subscription (Subscription)
import Control.Monad.ST (kind Region)
import Data.Array (deleteBy)
import Data.Foldable (traverse_)
import Data.Maybe (Maybe(..))
import Effect (Effect)
import Effect.Ref as Ref
import Effect.Unsafe (unsafePerformEffect)
import Unsafe.Reference (unsafeRefEq)

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


-- | Create an event and a function which supplies a value to that event.
openChannel :: ∀ a. Effect (Channel a a)
openChannel = do
  subscribers <- Ref.new []
  pure
    { event: Event \k -> do
        _ <- Ref.modify (_ <> [k]) subscribers
        pure do
          _ <- Ref.modify (deleteBy unsafeRefEq k) subscribers
          pure unit

    , sender: \a -> do
        Ref.read subscribers >>= traverse_ \k -> k a
    }


share :: ∀ a. Event a -> Event a
share = shareWhen (\s a -> s a)

shareWhen :: ∀ a b
  . (Sender b -> a -> Effect Unit)
 -> Event a
 -> Event b
shareWhen f e = unsafePerformEffect do
  -- a new event is created with no side effects (subscription to
  -- parent event is performed when subscribing to new event)
  -- => so usage of unsafePerformEffect is safe
  { sender, event } <- openChannel
  refs <- Ref.new 0
  cancelParentRef <- Ref.new Nothing

  pure $ Event \s -> do
     cancel <- subscribe event s
     count <- Ref.modify ((+) 1) refs
     if count > 1
       then pure unit
       else do
          -- first subscriber => connect to parent event
          c <- subscribe e (f sender)
          Ref.write (Just c) cancelParentRef

     pure do
        cancel
        count' <- Ref.modify ((-) 1) refs
        if count' > 0
          then pure unit
          -- last subscriber left => disconnect from parent event
          else Ref.read cancelParentRef >>= run

  where
    run Nothing = pure unit
    run (Just eff) = eff


foldp ::
  ∀ a b. Show a => Show b => (a -> b -> b) -> b -> Event a -> Event b
foldp f b (Event e) =
  Event \s -> do
    r <- Ref.new b
    e (\a -> Ref.modify (f a) r >>= s)


filter :: forall a. (a -> Boolean) -> Event a -> Event a
filter p (Event e) = Event \k -> e \a -> if p a then k a else pure unit


switch :: ∀ a. (a -> Subscription) -> Event a -> a -> Subscription
switch createSubscr (Event e) a0 = do
  cs <- createSubscr a0
  r <- Ref.new cs
  ce <- e (handle r)
  pure do
    Ref.read r >>= run
    cs

  where
    run eff = eff

    handle r a = do
      Ref.read r >>= run
      cs' <- createSubscr a0
      Ref.write cs' r
