module Alchemy.Entity.Storage
  ( Storage
  , EntityId(..)
  , Entity
  , Accessor
  , class RowSubset
  , empty
  , init
  , get
  , set
  , access
  , with
  , whereId
  , read
  , run
  -- , write
  ) where

import Prelude
import Control.Monad.Eff (Eff)
import Control.Monad.ST (ST)
import Data.Symbol (class IsSymbol, SProxy, reflectSymbol)
import Type.Row (RProxy)
import Alchemy.FRP.Stream (Stream, fromCallback)

class RowSubset (r :: # Type) (s :: # Type)
instance rowSubset :: Union r t s => RowSubset r s

foreign import data Storage :: # Type → Type

foreign import data System :: Type → Type

foreign import data Accessor :: # Type → # Type → Type

newtype EntityId = EntityId String

instance showEntityId :: Show EntityId where
  show (EntityId e) = "(Entity " <> e <> ")"

instance eqEntityId :: Eq EntityId where
  eq (EntityId e1) (EntityId e2) = e1 == e2

type Entity e = { entityId :: EntityId | e }

foreign import empty ::
  ∀ s. RProxy s → Storage s

foreign import init ::
  ∀ entity
  . Array { entityId :: EntityId | entity }
  → Storage ( entityId :: EntityId | entity )

foreign import setFn ::
  ∀ s1 s2 e h entity
  . Record ( entityId :: EntityId | entity )
  → Storage s1
  → Eff ( st :: ST h | e ) (Storage s2)

set ::
  ∀ s e eff h
  . RowSubset e s
  ⇒ Entity e
  → Storage s
  → Eff ( st :: ST h | eff ) (Storage s)
set e s =
  setFn e s

foreign import access ::
  ∀ c. Storage c → Accessor c ()

foreign import withFn :: ∀ c r1 r2
  . String
  → Accessor c r1
  → Accessor c r2

with ::
  ∀ c ca l a r1 r2
  . IsSymbol l
  ⇒ RowCons l a ca c
  ⇒ RowCons l a r1 r2
  ⇒ SProxy l
  → Accessor c r1
  → Accessor c r2
with sym acc =
  withFn (reflectSymbol sym) acc

foreign import whereId ::
  ∀ w c
  . EntityId
  → Accessor w c
  → Accessor w c

foreign import readFn ::
  ∀ store entity a b c
  . (((a → b) → c) → Stream a)
  → Accessor store entity
  → Stream { entityId :: EntityId | entity }

read ::
  ∀ store entity
  . Accessor store entity
  → Stream { entityId :: EntityId | entity }
read =
  readFn fromCallback

foreign import runFn ::
  ∀ store ei eo eff h
  . (Record ei → Record eo)
  → Accessor store ei
  → Eff (st :: ST h | eff) Unit

run ::
  ∀ store ei eo eff h
  . RowSubset ei store
  ⇒ RowSubset eo store
  ⇒ (Record ei → Record eo)
  → Accessor store ei
  → Eff (st :: ST h | eff) Unit
run fn acc =
  runFn fn acc

newtype EL e = EL (∀ eff h. Eff (st :: ST h | eff) (Entity e))

foreign import get :: ∀ eff h e s.
  RProxy e → Storage s → Eff (st :: ST h | eff) (Entity e)

