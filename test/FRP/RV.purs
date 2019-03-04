module Test.Alchemy.FRP.RV
  ( tests
  ) where

import Prelude

import Control.Monad.State (StateT)
import Data.Identity (Identity)
import Effect.Aff (Aff)
import Effect.Class (liftEffect)
import Effect.Ref as Ref
import Test.Spec (Group, describe, it)
import Test.Spec.Assertions (shouldEqual)

tests :: StateT (Array (Group (Aff Unit))) Identity Unit
tests =
  describe "Alchemy.FRP.RV" do
    describe "smart constructors" do
      it "allows to create together with a channel function" do
        result <- liftEffect do
          pure "foo"

        result `shouldEqual` "bar"

