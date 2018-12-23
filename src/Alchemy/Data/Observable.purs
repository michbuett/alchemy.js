module Alchemy.Data.Observable
  ( OV
  , create
  , foldEvent
  , increments
  , changes
  , values
  , read
  , get
  ) where


import Prelude

import Alchemy.Data.Incremental (Increment, Patch, noop, patch)
import Alchemy.Data.Incremental (const) as P
import Alchemy.Data.Incremental.Types (class Patchable, fromChange)
import Alchemy.FRP.Event (Event, Sender, multiplex, openChannel, send, subscribe)
import Data.Maybe (Maybe(..), fromJust)
import Effect (Effect)
import Effect.Ref as Ref
import Effect.Unsafe (unsafePerformEffect)
import Partial.Unsafe (unsafePartial)
import Prim.Row (class Cons)
import Record.Unsafe (unsafeGet)
import Type.Prelude (class IsSymbol, SProxy, reflectSymbol)


-- | An incremental and observable value
newtype OV a = OV { value :: Effect a, increments :: Event (Increment a) }


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
       notify s (patch (f a) currVal)

    notify _ { delta: Nothing } = pure unit
    notify send incr = send incr
