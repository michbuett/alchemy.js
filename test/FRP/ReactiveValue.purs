module Test.Alchemy.FRP.ReactiveValue
  ( tests
  ) where

import Prelude

import Alchemy.FRP.Channel (channel, send)
import Alchemy.FRP.ReactiveValue (RV, constant, inspect, run, simpleMap, step, testRV)
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
      it "allows to create streams from pure values" do
        unsafePerformEff ( inspect $ constant "foo" )
          `shouldEqual` "foo"

      it "allows to create streams from channels" do
        unsafePerformEff (do
          c <- channel
          v <- pure (step 1 c)
          send c 2
          send c 3
          inspect v) `shouldEqual` 3

    describe "as a Functor" do
      it "supports '<$>'" do
        unsafePerformEff (do
          let v = pure 1 :: RV Int
              v' = (\x -> x + 1) <$> v
          inspect v') `shouldEqual` 2

      it "supports '<#>'" do
        unsafePerformEff (do
          let v = pure 1 :: RV Int
              v' = v <#> (\x -> x + 1)
          inspect v') `shouldEqual` 2

      it "satifies the identity law"
         let v = pure 1
             vid = id v :: RV Int
             vmapid = id <$> v :: RV Int
             v1 = unsafePerformEff $ inspect vid
             v2 = unsafePerformEff $ inspect vmapid
          in
         v1 `shouldEqual` v2

      it "satifies the composition law" do
         let v = pure "X"
             f = \x -> "foo(" <> x <> ")"
             g = \x -> "bar(" <> x <> ")"
             rv1 = map (f <<< g) v
             rv2 = (map f <<< map g) v
             v1 = unsafePerformEff $ inspect rv1
             v2 = unsafePerformEff $ inspect rv2

         v1 `shouldEqual` "foo(bar(X))"
         v1 `shouldEqual` v2

    describe "as an Applicative" do
      it "supports 'pure'" do
        unsafePerformEff ( inspect $ pure "foo" :: RV String )
          `shouldEqual` "foo"

      it "supports '<*>'" do
        unsafePerformEff (do
          let vx = pure 1 :: RV Int
              vf = pure (\x -> x + 1) :: RV (Int → Int)
          inspect $ vf <*> vx) `shouldEqual` 2

      it "supports '<*>' when changing values" do
        let x1 = 1
            x2 = 10
            f1 = \x -> x + 1
            f2 = \x -> 10 * x

        unsafePerformEff (do
          ref <- newSTRef []
          cf <- channel
          cx <- channel
          rv <- pure $ (step f1 cf) <*> (step x1 cx)
          run $ rv <#> collect ref
          send cf f2
          send cx x2
          readSTRef ref) `shouldEqual` [2, 10, 100]

      it "satisfies the law of associative composition" do
        let rf = pure (\x -> 10 * x) :: RV (Int → Int)
            rg = pure (\x -> x + 1) :: RV (Int → Int)
            rh = pure 5 :: RV Int
            rLeft = (<<<) <$> rf <*> rg <*> rh
            rRight = rf <*> (rg <*> rh)
            vLeft = unsafePerformEff $ inspect rLeft
            vRight = unsafePerformEff $ inspect rRight

        vLeft `shouldEqual` 60 -- = 10 * (5 + 1)
        vRight `shouldEqual` 60

    describe "as a Monad" do
      it "supports 'bind'" do
        let c1 = unsafePerformEff channel
            c2 = unsafePerformEff channel
            rv = step 0 c1
            r_ = simpleMap (\x -> x + 2000) rv
            r_1 = r_ <#> \x -> x + 200
            r_2 = r_ <#> \x -> x + 300
            f = \x -> (step 0 c2) <#> (\y -> x + y)

        unsafePerformEff (do
          ref <- newSTRef []
          run $ rv >>= f <#> collect ref
          -- start with [0] (0 + 0)
          testRV r_1
          testRV r_2
          testRV rv
          send c1 1 -- add 1 (1 + 0)
          send c1 2 -- add 2 (2 + 0)
          send c2 10 -- add 12 (2 + 10)
          send c1 5 -- add 15 (5 + 10)
          readSTRef ref) `shouldEqual` [0, 1, 2, 12, 15]

      it "satisfies left identity: (pure x >>= f = f x)" do
         let f = \x -> constant (x * x)
             left = pure 5 >>= f
             right = f 5

         unsafePerformEff (inspect left) `shouldEqual` 25
         unsafePerformEff (inspect right) `shouldEqual` 25

      it "satisfies right identity: (x >>= pure = x)" do
        let left = constant 10 >>= pure
            right = constant 10

        unsafePerformEff (inspect left) `shouldEqual` 10
        unsafePerformEff (inspect right) `shouldEqual` 10

      it "satisfies associativity: (m >>= f) >>= g = m >>= (\\x -> f x >>= g)" do
        let f = \x -> constant (x + 1)
            g = \x -> constant (10 * x)
            left = (constant 10 >>= f) >>= g
            right = constant 10 >>= (\x -> f x >>= g)

        unsafePerformEff (inspect left) `shouldEqual` 110
        unsafePerformEff (inspect right) `shouldEqual` 110
