module Alchemy.Data.Increment.Value
  where

import Prelude

import Alchemy.Data.Incremental (Patch(..), runPatch)
import Alchemy.FRP.Event (Event(..), Sender, openChannel, subscribe)
import Data.Maybe (Maybe(..))
import Effect (Effect)
import Effect.Ref as Ref


newtype IV a = IV { v :: Effect a, e :: Event a }

create :: ∀ a. a -> Effect { iv :: IV a, send :: Sender (Patch a) }
create a = do
  v <- Ref.new a
  { event: eIn, sender: sIn } <- openChannel
  { event: eOut, sender: sOut } <- openChannel
  _ <- subscribe eIn (update v sOut)
  pure $ { iv: IV { v: Ref.read v, e: eOut}, send: sIn }

  where
    update v s p = do
       a' <- Ref.read v
       notify v s (runPatch p a')

    notify _ _ { delta: Nothing } = pure unit
    notify v send { new } = do
      _ <- Ref.write new v
      send new


-- values :: ∀ a. IV a -> RV a

-- deltas :: ∀ a da. Patchable a da => IV a -> RV da

