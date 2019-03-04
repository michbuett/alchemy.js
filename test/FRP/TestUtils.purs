module Test.Alchemy.FRP.TestUtils where

import Prelude

import Alchemy.FRP.Event (Channel, Event, openChannel, subscribe)
import Effect (Effect, foreachE)
import Effect.Ref (new, read, write)
import Effect.Unsafe (unsafePerformEffect)

inspectChannel ::
  ∀ i o. Monoid o => Channel i o → i → Effect o
inspectChannel { sender: s, event } v = do
  ref <- new mempty
  unsubscribe <- subscribe event (\x -> write x ref)
  s v
  unsubscribe
  read ref

inspectChannelUnsafe ::
  ∀ i o. Monoid o => Channel i o -> i -> o
inspectChannelUnsafe channel input =
  unsafePerformEffect $ inspectChannel channel input

inspectEvent ::
  ∀ a. Monoid a => Event a -> Effect a
inspectEvent e = do
  ref <- new mempty
  _ <- subscribe e (\x -> write x ref)
  read ref

inspectEventUnsafe ::
  ∀ a. Monoid a => Event a -> a
inspectEventUnsafe e =
  unsafePerformEffect $ inspectEvent e

testEvent :: ∀ a b. (Event a -> Event b) -> Array a -> Array b
testEvent f xs =
  unsafePerformEffect (do
    ref <- new []
    { sender: s, event } <- openChannel
    unsubscribe <- subscribe (f event) (\x -> do
                                          arr <- read ref
                                          write (arr <> [x]) ref)
    foreachE xs s
    read ref
  )
