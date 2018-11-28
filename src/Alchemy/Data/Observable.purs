module Alchemy.Data.Observable
  ( OV
  , create
  , bimap
  , increments
  , changes
  , values
  , read
  ) where


import Prelude

import Alchemy.Data.Incremental (Increment)
import Alchemy.Data.Incremental.Types (class Patchable, Change, fromChange)
import Alchemy.FRP.Event (Event, Sender, multiplex, openChannel, send, subscribe)
import Data.Maybe (Maybe(..), fromJust)
import Effect (Effect)
import Effect.Ref as Ref
import Partial.Unsafe (unsafePartial)
import Prim.Row (class Cons)
import Type.Prelude (class IsSymbol, SProxy(..))


-- | An incremental and observable value
newtype OV a = OV { value :: Effect a, increments :: Event (Increment a) }


bimap ::
  ∀ a b
  . (a -> b)
 -> (Change a -> Change b)
 -> OV a
 -> OV b
bimap mapV mapD (OV { value, increments: i }) =
  OV { value: mapV <$> value
     , increments: multiplex mapChanges i
     }

  where
    mapChanges :: Sender (Increment b) -> Increment a -> Effect Unit
    mapChanges s { new: a, delta: da } =
      let db = mapD <$> da
       in case db of
            Nothing -> pure unit
            Just _  -> send s { new: mapV a, delta: db }


create ::
  ∀ a b
  -- . (a -> Patch b)
  . (a -> b -> Increment b)
 -> b
 -> Effect { ov :: OV b, sender :: Sender a }
create f b = do
  { event: ea, sender: sa } <- openChannel
  { event: eb, sender: sb } <- openChannel
  r <- Ref.new b
  _ <- subscribe ea (handle r sb)
  pure { ov: OV { value: Ref.read r, increments: eb }
       , sender: sa
       }
  where
    handle r s a = do
       b' <- Ref.read r
       notify r s (f a b')
       -- notify r s (patch (f a) b')

    notify _ _ { delta: Nothing } = pure unit
    notify r s i = do
       Ref.write i.new r
       send s i

increments :: ∀ a. OV a -> Event (Increment a)
increments (OV { increments: i }) = i

values :: ∀ a. OV a -> Event a
values ov = _.new <$> increments ov

changes :: ∀ a da. Patchable a da => OV a -> Event da
changes ov = getDelta <$> increments ov
  where
    getDelta { delta: d } =
      -- unsafePartial is safe because an OV triggers only if there are changes
      fromChange (unsafePartial (fromJust d))

read :: ∀ a. OV a -> Effect a
read (OV { value }) = value

-- get ::
--   ∀ l a rs r
--   . IsSymbol l
--  => Cons l a rs r
--  => SProxy l
--  -> OV (Record r)
--  -> OV a
-- get key ov =
--   bimap (
--
--
-- -- NO! better allow observe mapped values or folds
-- -- at ::
-- --   ∀ a da
-- --   . Int
-- --  -> OV (Array (IValue a da)) (ArrayUpdate a da)
-- --  -> OV a da
-- -- at =
-- --   subImpl openChannel
--
-- --
-- -- foreign import debug :: // TODO
-- --   ∀ a. a -> Effect Unit
-- --
-- -- -- newtype OChange a da oa =
-- -- --   OChange { delta :: da, patch :: (a -> OResult a oa) }
-- -- --
-- -- -- oberveChange obs dx x =
-- -- --   { oldValue: x
-- -- --   , newValue: patch x
-- -- --   , delta: dx
-- -- --   }
