module Alchemy.Data.Observable
  where
  -- ( OResult
  -- , OIValue
  -- ) where


import Alchemy.Data.Incremental (IValue)
import Alchemy.Data.Incremental.Record (RecordUpdate)
import Alchemy.FRP.Event (Channel, Event, Sender, openChannel)
import Data.Function.Uncurried (Fn2, runFn2)
import Data.Symbol (class IsSymbol, SProxy, reflectSymbol)
import Effect (Effect)
import Type.Row (kind RowList, class Cons)


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
  ∀ a da. OIValue a da -> Event da


foreign import sample ::
  ∀ a da. OIValue a da -> Effect (IValue a da)


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
