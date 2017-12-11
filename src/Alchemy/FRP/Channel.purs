module Alchemy.FRP.Channel
  ( Channel
  , FRP
  , channel
  , subscribe
  , send
  , fps
  ) where

import Prelude (Unit)
import Control.Monad.Eff (Eff, kind Effect)

foreign import data Channel :: Type → Type

foreign import data FRP :: Effect

foreign import channel :: ∀ e a.
  Eff (frp :: FRP | e) (Channel a)

foreign import subscribe ::
  ∀ a e r
  . (a → Eff (e) r)
  → Channel a
  → Eff (frp :: FRP | e) Unit

foreign import send :: ∀ e a.
  Channel a → a → Eff (frp :: FRP | e) Unit

foreign import fps :: Number → Channel Number
