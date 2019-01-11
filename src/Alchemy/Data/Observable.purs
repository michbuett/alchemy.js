module Alchemy.Data.Observable
  ( OV
  , create
  , create'
  , constant
  , foldEvent
  , increments
  , changes
  , values
  , sample
  , get
  , mapOV
  ) where


import Prelude hiding (map)

import Alchemy.Data.Incremental (Increment, Patch, noop, runPatch)
import Alchemy.Data.Incremental (const) as P
import Alchemy.Data.Incremental.Array (updateAt)
import Alchemy.Data.Incremental.Atomic (set)
import Alchemy.Data.Incremental.Types (class Patchable, fromChange, mapChange)
import Alchemy.FRP.Event (Event(..), Sender, multiplex, openChannel, send, subscribe)
import Alchemy.FRP.RV (RV)
import Alchemy.FRP.RV as RV
import Data.Maybe (Maybe(..), fromJust, isJust)
import Effect (Effect)
import Effect.Ref as Ref
import Effect.Unsafe (unsafePerformEffect)
import Partial.Unsafe (unsafePartial)
import Prim.Row (class Cons)
import Record.Unsafe (unsafeGet)
import Type.Prelude (class IsSymbol, SProxy, reflectSymbol)
import Unsafe.Coerce (unsafeCoerce)


-- | An incremental and observable value
newtype OV a =
  OV { value :: Effect a
     , increments :: Event (Increment a)
     }

-- | A constant (never changing) observable value
constant :: ∀ a. a -> OV a
constant a =
  OV { value: pure a
     , increments: pure { new: a, delta: Nothing }
     }

create ::
  ∀ a b
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

    notify _ _ { delta: Nothing } = pure unit
    notify r s i = do
       Ref.write i.new r
       send s i

create' :: ∀ a. a -> Effect { ov :: OV a, sender :: Sender (Increment a) }
create' b = do
  { event: ea, sender: sa } <- openChannel
  { event: eb, sender: sb } <- openChannel
  r <- Ref.new b
  _ <- subscribe ea (handle r sb)
  pure { ov: OV { value: Ref.read r, increments: eb }, sender: sa }

  where
    handle _ _ { delta: Nothing } = pure unit
    handle r s i = do
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

sample :: ∀ a. OV a -> Effect a
sample (OV { value }) = value

get ::
  ∀ l a d rs r
  . IsSymbol l
 => Cons l a rs r
 => Patchable (Record r) (Record d)
 => SProxy l
 -> OV (Record r)
 -> OV a
get key (OV { value, increments: i }) =
  foldEvent f v i
  where
    v =
      getValue (unsafePerformEffect value)

    f { delta: Nothing } = noop
    f { new: r, delta: Just ir } =
      P.const { new: getValue r, delta: getChange ir }

    getValue =
      unsafeGet (reflectSymbol key)

    getChange =
      unsafeGet (reflectSymbol key) <<< fromChange


foldEvent :: ∀ a b. (a -> Patch b) -> b -> Event a -> OV b
foldEvent f initialVal e =
  OV { value: v, increments: i }
  where
    v = Ref.read ref

    i = multiplex update e

    ref = unsafePerformEffect (Ref.new initialVal)

    update s a = do
       currVal <- Ref.read ref
       notify s (runPatch (f a) currVal)

    notify _ { delta: Nothing } = pure unit
    notify send incr = do
      _ <- Ref.write incr.new ref
      send incr

foldOV :: ∀ a da b
  . Patchable a da => (da -> b -> Increment b) -> b -> OV a -> OV b
foldOV f b (OV { value: va, increments: eia }) =
  OV { value: v, increments: ei }
  where
    v = Ref.read ref

    ei = multiplex update eia

    ref = unsafePerformEffect (Ref.new b)

    update _ { delta: Nothing } = pure unit
    update s { delta: Just da } = do
       currVal :: b <- v
       notify s (f (fromChange da) currVal)

    notify _ { delta: Nothing } = pure unit
    notify send incr = do
      _ <- Ref.write incr.new ref
      send incr

mapOV :: ∀ a b f
  . Functor f
 => Patchable a (f a)
 => Patchable b (f b)
 => (a -> b)
 -> OV a
 -> OV b
mapOV f (OV { value, increments: i }) =
  OV { value: f <$> value
     , increments: mapi <$> i
     }
  where
    mapi :: Increment a -> Increment b
    mapi { new: a, delta: Nothing } = { new: f a, delta: Nothing }
    mapi { new: a, delta: Just da } = { new: f a, delta: Just (mapChange f da) }


newtype OV2 a = OV2 (RV (Increment a) (Increment a))

createFromRV :: ∀ a. a -> Effect { ov :: OV2 a, send :: Sender (Patch a) }
createFromRV a = do
  rv <- RV.create (\i -> if isJust i.delta then Just i else Nothing) ia

  pure { ov: OV2 rv
       , send: \p -> do
          i <- RV.get rv
          RV.set rv (runPatch p i.new)
       }

  where
    ia = { new: a, delta: Nothing }


filterIncrements :: ∀ a. Increment a -> Maybe (Increment a)
filterIncrements { delta: Nothing } = Nothing
filterIncrements i = Just i


-- foldOV2 :: ∀ a da b
--   . Patchable a da => (da -> b -> Increment b) -> b -> OV2 a -> OV2 b
-- foldOV2 f b (OV2 rv) =
--   OV $ RV
--   { i: \i -> pure unit
--   ,
--
--   out = unsafePerformEffect $ RV.create filterIncrements (liftIncr b)
