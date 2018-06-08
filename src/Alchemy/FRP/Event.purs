module Alchemy.FRP.Event
  ( Channel
  , Event
  , Send
  , openChannel
  , multiplex
  , subscribe
  , foldp
  , send
  , filter
  , dropRepeats
  , dropRepeats'
  , switcher
  ) where

import Prelude

import Alchemy.FRP.Subscription (Subscription)
import Control.Monad.Eff (Eff)
import Data.Function.Uncurried (Fn2, runFn2)

type Channel i o = { send :: Send i, event :: Event o }

foreign import data Event :: Type -> Type

foreign import data Send :: Type -> Type

foreign import mapImpl ::
  ∀ a b.  Fn2 (a → b) (Event a) (Event b)

instance mapEvent :: Functor Event where
  map = runFn2 mapImpl

foreign import applyImpl ::
  ∀ a b.  Fn2 (Event (a → b)) (Event a) (Event b)

instance applyEvent :: Apply Event where
  apply = runFn2 applyImpl

foreign import pureImpl ::
  ∀ a. a → Event a

instance applicativeEvent :: Applicative Event where
  pure = pureImpl

foreign import subscribe ::
  ∀ e a r. Event a → (a → Eff e r) → Subscription

foreign import openChannel ::
  ∀ a e. Eff e (Channel a a)

foreign import multiplex ::
  ∀ a. Event a -> Event a

foreign import foldp ::
  ∀ a b. (a -> b -> b) -> b -> Event a -> Event b

foreign import send ::
  ∀ a e. Send a -> a -> Eff e Unit

foreign import filter ::
  ∀ a. (a -> Boolean) -> Event a -> Event a

foreign import dropRepeats ::
  ∀ a. Eq a => Event a -> Event a

foreign import dropRepeats' ::
  ∀ a. Event a -> Event a

foreign import switcher ::
  ∀ a. (a → Subscription) → Event a → Subscription
