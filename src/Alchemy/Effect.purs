module Alchemy.Effect
  ( Effect
  ) where

import Control.Monad.Eff (Eff, runPure)

type Effect a = Eff () a

run :: ∀ a. Effect a → a
run e = runPure e
