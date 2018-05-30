module Test.Alchemy.FRP.ReactiveValue
  ( tests
  ) where

import Prelude

import Alchemy.FRP.Channel (channel, send)
import Alchemy.FRP.ReactiveValue (RV, constantRV, createRV, inspectRV, sinkRV, stepRV)
import Control.Monad.Aff (Aff)
import Control.Monad.Eff (Eff)
import Control.Monad.Eff.Unsafe (unsafePerformEff)
import Control.Monad.ST (ST, STRef, newSTRef, readSTRef, writeSTRef)
import Control.Monad.State (StateT)
import Data.Identity (Identity)
import Test.Spec (Group, describe, it)
import Test.Spec.Assertions (shouldEqual)

collect :: ∀ h e. STRef h (Array Int) → Int → Eff (st :: ST h | e) (Array Int)
collect ref x = do
  arr <- readSTRef ref
  writeSTRef ref (arr <> [x])

tests :: forall t1. StateT (Array (Group (Aff t1 Unit))) Identity Unit
tests =
  describe "Alchemy.FRP.ReactiveValue" do
    describe "smart constructors" do
      it "allows to create constant reactive values" do
        unsafePerformEff ( inspectRV $ constantRV "foo" )
          `shouldEqual` "foo"

      it "allows to create reactive values together with a modify function" do
        unsafePerformEff ( do
          { rv, setValue } <- createRV "foo"
          setValue "bar"
          inspectRV rv
        ) `shouldEqual` "bar"

      it "allows to create reactive values from channels" do
        unsafePerformEff (do
          c <- channel
          v <- pure (stepRV 1 c)
          send c 2
          send c 3
          inspectRV v) `shouldEqual` 3

    describe "as a Functor" do
      it "supports '<$>'" do
        unsafePerformEff (do
          let v = pure 1 :: RV Int
              v' = (\x -> x + 1) <$> v
          inspectRV v') `shouldEqual` 2

      it "supports '<#>'" do
        unsafePerformEff (do
          let v = pure 1 :: RV Int
              v' = v <#> (\x -> x + 1)
          inspectRV v') `shouldEqual` 2

      it "satifies the identity law"
         let v = pure 1
             vid = id v :: RV Int
             vmapid = id <$> v :: RV Int
             v1 = unsafePerformEff $ inspectRV vid
             v2 = unsafePerformEff $ inspectRV vmapid
          in
         v1 `shouldEqual` v2

      it "satifies the composition law" do
         let v = pure "X"
             f = \x -> "foo(" <> x <> ")"
             g = \x -> "bar(" <> x <> ")"
             rv1 = map (f <<< g) v
             rv2 = (map f <<< map g) v
             v1 = unsafePerformEff $ inspectRV rv1
             v2 = unsafePerformEff $ inspectRV rv2

         v1 `shouldEqual` "foo(bar(X))"
         v1 `shouldEqual` v2

    describe "as an Applicative" do
      it "supports 'pure'" do
         unsafePerformEff ( inspectRV $ pure "foo" :: RV String )
          `shouldEqual` "foo"

      it "supports '<*>'" do
        unsafePerformEff (do
          let vx = pure 1 :: RV Int
              vf = pure (\x -> x + 1) :: RV (Int → Int)
          inspectRV $ vf <*> vx) `shouldEqual` 2

      it "supports '<*>' when changing values" do
        let x1 = 1
            x2 = 10
            f1 = \x -> x + 1
            f2 = \x -> 10 * x

        unsafePerformEff (do
          ref <- newSTRef []
          cf <- channel
          cx <- channel
          rv <- pure $ (stepRV f1 cf) <*> (stepRV x1 cx)
          _ <- sinkRV $ rv <#> collect ref
          send cf f2
          send cx x2
          readSTRef ref) `shouldEqual` [2, 10, 100]

      it "satisfies the law of associative composition" do
        let rf = pure (\x -> 10 * x) :: RV (Int → Int)
            rg = pure (\x -> x + 1) :: RV (Int → Int)
            rh = pure 5 :: RV Int
            rLeft = (<<<) <$> rf <*> rg <*> rh
            rRight = rf <*> (rg <*> rh)
            vLeft = unsafePerformEff $ inspectRV rLeft
            vRight = unsafePerformEff $ inspectRV rRight

        vLeft `shouldEqual` 60 -- = 10 * (5 + 1)
        vRight `shouldEqual` 60

    describe "as a Monad" do
      it "supports 'bind'" do
        let c1 = unsafePerformEff channel
            c2 = unsafePerformEff channel
            rv = stepRV 0 c1
            f = \x -> (stepRV 0 c2) <#> (\y -> x + y)

        unsafePerformEff (do
          ref <- newSTRef []
          _ <- sinkRV $ rv >>= f <#> collect ref
          -- start with [0] (0 + 0)
          send c1 1 -- add 1 (1 + 0)
          send c1 2 -- add 2 (2 + 0)
          send c2 10 -- add 12 (2 + 10)
          send c1 5 -- add 15 (5 + 10)
          readSTRef ref) `shouldEqual` [0, 1, 2, 12, 15]

      it "satisfies left identity: (pure x >>= f = f x)" do
         let f = \x -> constantRV (x * x)
             left = pure 5 >>= f
             right = f 5

         unsafePerformEff (inspectRV left) `shouldEqual` 25
         unsafePerformEff (inspectRV right) `shouldEqual` 25

      it "satisfies right identity: (x >>= pure = x)" do
        let left = constantRV 10 >>= pure
            right = constantRV 10

        unsafePerformEff (inspectRV left) `shouldEqual` 10
        unsafePerformEff (inspectRV right) `shouldEqual` 10

      it "satisfies associativity: (m >>= f) >>= g = m >>= (\\x -> f x >>= g)" do
        let f = \x -> constantRV (x + 1)
            g = \x -> constantRV (10 * x)
            left = (constantRV 10 >>= f) >>= g
            right = constantRV 10 >>= (\x -> f x >>= g)

        unsafePerformEff (inspectRV left) `shouldEqual` 110
        unsafePerformEff (inspectRV right) `shouldEqual` 110
