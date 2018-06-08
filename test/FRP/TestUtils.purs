module Test.Alchemy.FRP.TestUtils where

import Prelude

import Alchemy.FRP.Event (Channel, Event, openChannel, send, subscribe)
import Control.Monad.Eff (Eff, foreachE)
import Control.Monad.Eff.Unsafe (unsafePerformEff)
import Control.Monad.ST (ST, newSTRef, readSTRef, writeSTRef)
import Data.Monoid (class Monoid, mempty)

inspectChannel ::
  ∀ i o e h. Monoid o => Channel i o → i → Eff (st :: ST h | e) o
inspectChannel { send: s, event } v = do
  ref <- newSTRef mempty
  unsubscribe <- subscribe event (\x -> writeSTRef ref x)
  send s v
  unsubscribe
  readSTRef ref

inspectChannelUnsafe ::
  ∀ i o. Monoid o => Channel i o -> i -> o
inspectChannelUnsafe channel input =
  unsafePerformEff $ inspectChannel channel input

inspectEvent ::
  ∀ a e h. Monoid a => Event a -> Eff (st :: ST h | e) a
inspectEvent e = do
  ref <- newSTRef mempty
  _ <- subscribe e (\x -> writeSTRef ref x)
  readSTRef ref

inspectEventUnsafe ::
  ∀ a. Monoid a => Event a -> a
inspectEventUnsafe e =
  unsafePerformEff $ inspectEvent e

testEvent :: ∀ a b. (Event a -> Event b) -> Array a -> Array b
testEvent f xs =
  unsafePerformEff (do
    ref <- newSTRef []
    { send: s, event } <- openChannel
    unsubscribe <- subscribe (f event) (\x -> do
                                          arr <- readSTRef ref
                                          writeSTRef ref (arr <> [x]))
    foreachE xs (send s)
    readSTRef ref
  )
