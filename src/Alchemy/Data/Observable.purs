module Alchemy.Data.Observable
  where
  -- ( OV
  -- , create
  -- , create'
  -- , constant
  -- , foldEvent
  -- , increments
  -- , changes
  -- , values
  -- , sample
  -- , get
  -- ) where


import Prelude hiding (map)

import Alchemy.Data.Increment.Value (IVal, delta, increment, next, value)
import Alchemy.Data.Incremental (Increment, Patch, noop, runPatch, class Patchable, fromChange)
import Alchemy.Debug (debugLog)
import Alchemy.FRP.Event (Event, Sender, openChannel, shareWhen, subscribe)
import Data.Maybe (Maybe(..), fromJust)
import Effect (Effect)
import Effect.Ref as Ref
import Effect.Unsafe (unsafePerformEffect)
import Partial.Unsafe (unsafePartial)
import Prim.Row (class Cons)
import Record.Unsafe (unsafeGet)
import Type.Prelude (class IsSymbol, SProxy, reflectSymbol)


-- | An incremental and observable value
newtype OVal a =
  OVal
     { val :: Effect a
     , inc :: Event (Increment a)
     }

-- | A constant (never changing) observable value
constant :: ∀ a. a -> OVal a
constant a =
  OVal { val: pure a
       , inc: pure { new: a, delta: Nothing }
       }

create ::
  ∀ i o
  . IVal i o
 -> Effect { sender :: Sender i, ov :: OVal o }
create ival = do
  { event: eIn, sender: sIn } <- openChannel

  { event: eOut, sender: sOut } <- openChannel

  r <- Ref.new ival

  let handle a = do
       -- debugLog "input" a
       ival' <- Ref.modify (next a) r
       -- debugLog "new increment" ival'
       case (delta ival') of
         Nothing -> pure unit
         Just _ -> sOut (increment ival')

  _ <- subscribe eIn handle

  pure { sender: sIn
       , ov: OVal
         { val: do
             iv <- Ref.read r
             pure (value iv)
         , inc: eOut
         }
       }

-- create' :: ∀ a. a -> Effect { ov :: OV a, sender :: Sender (Increment a) }
-- create' b = do
--   { event: ea, sender: sa } <- openChannel
--   { event: eb, sender: sb } <- openChannel
--   r <- Ref.new b
--   _ <- subscribe ea (handle r sb)
--   pure { ov: OV { val: Ref.read r, inc: eb }, sender: sa }
--
--   where
--     handle _ _ { delta: Nothing } = pure unit
--     handle r s i = do
--        Ref.write i.new r
--        s i
--


increments :: ∀ a. OVal a -> Event (Increment a)
increments (OVal { inc }) = inc


values :: ∀ a. OVal a -> Event a
values ov = _.new <$> increments ov


changes :: ∀ a da. Patchable a da => OVal a -> Event da
changes ov = getDelta <$> increments ov
  where
    getDelta { delta: d } =
      -- unsafePartial is safe because an OV triggers only if there are changes
      fromChange (unsafePartial (fromJust d))


sample :: ∀ a. OVal a -> Effect a
sample (OVal { val }) = val


-- foldEvent :: ∀ a b. (a -> Patch b) -> b -> Event a -> Effect (OV b)
-- foldEvent f b0 e = do
--   ref <- Ref.new b0
--   eOut <- shareWhen (update ref) e
--   pure OV { val: Ref.read ref, inc: eOut }
--
--   where
--     update ref send a = do
--       b <- Ref.read ref
--       case runPatch (f a) b of
--         { delta: Nothing } -> pure unit
--         ib@{ new } -> do
--            Ref.write new ref
--            send ib
--
--
-- get ::
--   ∀ l a d rs r
--   . IsSymbol l
--  => Cons l a rs r
--  => Patchable (Record r) (Record d)
--  => SProxy l
--  -> OV (Record r)
--  -> OV a
-- get key (OV { val, inc }) = do
--   v0 <- val
--   foldEvent f (getValue v0) inc
--
--   where
--     f { delta: Nothing } = noop
--     f { new: r, delta: Just ir } =
--       P.const { new: getValue r, delta: getChange ir }
--
--     getValue =
--       unsafeGet (reflectSymbol key)
--
--     getChange =
--       unsafeGet (reflectSymbol key) <<< fromChange
--
--
-- -- -- | Maps observable values incrementally
-- -- imap :: ∀ a da b
-- --   . Patchable a da
-- --   => (a -> b)
-- --   -> (da -> Patch b)
-- --   -> OV a
-- --   -> OV b
-- -- imap fVal fDelta ova =
-- --   unsafeCoerce
