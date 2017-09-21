module Alchemy.Buffer
  ( BUFFER
  , Buffer
  , bufferSignal
  , drain
  , runBatch
  , sink
  , foreach
  )
  where

import Prelude (Unit)
import Control.Monad.Eff (Eff, kind Effect)
import Signal (Signal)
-- import Signal.Channel (Channel)

foreign import data Buffer :: Type -> Type

foreign import data BUFFER :: Effect

foreign import bufferSignal :: forall a. Signal a -> Buffer a

foreign import drain :: forall a. Buffer a -> Array a

foreign import runBatch ::
  ∀ a b e
  . Signal a
  → Array (a → Eff e Unit)
  → Signal b
  → Eff e Unit

foreign import sink ::
  ∀ a e
  . String
  → Signal a
  → Eff (buffer :: BUFFER | e) (Buffer a)

foreign import muff ::
  ∀ a b c e
  . Union a b c => Buffer (Record a)
  → String
  → Signal (Record b)
  → Eff (buffer :: BUFFER | e) (Buffer (Record c))

foreign import foreach ::
  ∀ a e
  . Buffer a
  → (Array a → Eff e Unit)
  → Eff e Unit

