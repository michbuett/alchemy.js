module Alchemy.Observable
  ( Observable
  , initialize
  , mutate
  , run
  )
  where

import Prelude (Unit)
import Control.Monad.Eff (Eff)
-- import Control.Monad.ST (ST)
import Signal

foreign import data Observable :: Type -> Type

foreign import initialize :: forall a. a -> Observable a

foreign import mutate ::
  forall a b. (a -> b -> b) -> Signal a -> Observable b -> Observable b

foreign import run ::
  forall a e. (a -> Eff (e) Unit) -> Observable a -> Eff (e) Unit

