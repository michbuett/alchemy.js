module Alchemy.FRP.Channel
  ( Channel
  , channel
  , subscribe
  , send
  , last
  ) where

import Control.Monad.Eff (Eff)
import Prelude (Unit)

foreign import data Channel :: Type → Type

foreign import channel ::
  ∀ a eff. Eff eff (Channel a)

foreign import subscribe ::
  ∀ a e1 r
  . (a → Eff e1 r)
  → Channel a
  → (∀ e2 e3. Eff e2 (Eff e3 Unit))

foreign import send ::
  ∀ a eff. Channel a → a → Eff eff Unit

foreign import last ::
  ∀ a e. a → Channel a → Eff e a
