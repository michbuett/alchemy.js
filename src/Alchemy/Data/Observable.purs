module Alchemy.Data.Observable
  where
  -- ( OResult
  -- , OIValue
  -- ) where


import Alchemy.Data.Incremental (IValue)
import Alchemy.Data.Incremental.Array (ArrayUpdate)
import Alchemy.Data.Incremental.Record (RecordUpdate)
import Alchemy.FRP.Event (Channel, Event, Sender, openChannel)
import Data.Function.Uncurried (Fn2, runFn2)
import Data.Symbol (class IsSymbol, SProxy, reflectSymbol)
import Effect (Effect)
import Type.Row (kind RowList, class Cons)


-- -- newtype OResult a oa =
-- --   OResult { result :: a, observation :: oa }
-- --
-- -- observe :: ∀ a b ob.
-- --   (a -> b -> ob) -> (a -> b) -> a -> OResult b ob
-- -- observe obs f x =
-- --   let y = f x
-- --    in OResult { result: y
-- --               , observation: obs x y
-- --               }
-- --
-- foreign import data Storage :: Type -> Type
--
-- foreign import createObsValue ::
--   ∀ a. Fn2 (Effect (Channel a a)) a (Storage a)
--
-- storeAtomic :: ∀ a. Atomic a -> Storage (Atomic a)
-- storeAtomic = runFn2 createObsValue openChannel
--
-- class StorageRL (r :: RowList) (s :: RowList) | s -> r
--
-- instance storageRLNil :: StorageRL Nil Nil
--
-- instance storageRLCons
--   :: ( IsSymbol l
--      , StorageRL rl sl
--      )
--   => StorageRL (RL.Cons l a rl) (RL.Cons l (Storage a) sl)
--
-- foreign import createObsRecord ::
--   ∀ a b. Fn2 (Effect (Channel a a)) a (Storage b)
--
-- storeRecord ::
--   ∀ r rl s sl
--   . RL.RowToList r rl
--  => RL.RowToList s sl
--  => StorageRL rl sl
--  => Record s
--  -> Storage (Record r)
-- storeRecord = runFn2 createObsRecord openChannel
--
-- foreign import values ::
--   ∀ a. Storage a -> Event a
--
type Update a da =
  { oldValue :: IValue a da
  , newValue :: IValue a da
  , delta :: da
  }

-- | An incremental and observable value
foreign import data OIValue :: Type -> Type -> Type


foreign import initStorage ::
  ∀ a da
  . Fn2 (Effect (Channel a a))
        (IValue a da)
        ({ oiValue :: OIValue a da, sender :: Sender da })


makeObservable ::
  ∀ a da
  . IValue a da
 -> { oiValue :: OIValue a da, sender :: Sender da }
makeObservable = runFn2 initStorage openChannel


foreign import updates ::
  ∀ a da. OIValue a da -> Event (Update a da)


foreign import sample ::
  ∀ a da. OIValue a da -> Effect a


foreign import subImpl ::
  ∀ c key a da b db
  . Effect (Channel c c)
 -> key
 -> OIValue a da
 -> OIValue b db


get ::
  ∀ l a da rs r
  . IsSymbol l
 => Cons l (IValue a da) rs r
 => SProxy l
 -> OIValue (Record r) (RecordUpdate r)
 -> OIValue a da
get key =
  subImpl openChannel (reflectSymbol key)


-- NO! better allow observe mapped values or folds
-- at ::
--   ∀ a da
--   . Int
--  -> OIValue (Array (IValue a da)) (ArrayUpdate a da)
--  -> OIValue a da
-- at =
--   subImpl openChannel

--
-- foreign import debug :: // TODO
--   ∀ a. a -> Effect Unit
--
-- -- newtype OChange a da oa =
-- --   OChange { delta :: da, patch :: (a -> OResult a oa) }
-- --
-- -- oberveChange obs dx x =
-- --   { oldValue: x
-- --   , newValue: patch x
-- --   , delta: dx
-- --   }
