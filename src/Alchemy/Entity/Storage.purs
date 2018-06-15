module Alchemy.Entity.Storage
  ( Storage
  , EntityId(..)
  , Entity
  , EntityList
  , Accessor
  , class RowSubset
  , empty
  , init
  , set
  , access
  , with
  , whereId
  , read
  , run
  -- , write
  ) where

import Prelude

import Data.Symbol (class IsSymbol, SProxy, reflectSymbol)
import Effect (Effect)
import Prim.Row (class Union, class Cons)
import Type.Row (RProxy)

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

type EntityList e = Array (Entity e)

foreign import empty ::
  ∀ s. RProxy s → Storage s

foreign import init ::
  ∀ entity
  . Array { entityId :: EntityId | entity }
  → Storage ( entityId :: EntityId | entity )

foreign import setFn ::
  ∀ s1 s2 entity
  . Record ( entityId :: EntityId | entity )
  → Storage s1
  → Effect (Storage s2)

set ::
  ∀ s e
  . RowSubset e s
  ⇒ Entity e
  → Storage s
  → Effect (Storage s)
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
  ⇒ Cons l a ca c
  ⇒ Cons l a r1 r2
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

foreign import read ::
  ∀ store entity
  . Accessor store entity
  → Effect (EntityList entity)

foreign import runFn ::
  ∀ store ei eo
  . (Record ei → Record eo)
  → Accessor store ei
  → Effect Unit

run ::
  ∀ store ei eo
  . RowSubset ei store
  ⇒ RowSubset eo store
  ⇒ (Record ei → Record eo)
  → Accessor store ei
  → Effect Unit
run fn acc =
  runFn fn acc
