module Main where

import Alchemy.Components

import Alchemy.Pixi (PIXI)
import Alchemy.Pixi.Application as App
import Alchemy.Pixi.Graphics (Color(..), Ref, assign, rect, updatePos)
import Control.Monad.Eff (Eff)
import DOM (DOM)
import Prelude (Unit, bind, (+), (*), (<), negate, (&&))
import Signal (Signal, runSignal, foldp, (<~))
import Type.Row (class RowLacks)

type R1 a = { x :: Int, y :: Int | a }
type R2 a = { x :: Int, z :: Int | a }

type BallState =
  { pixiRef :: Ref
  , x :: Number
  , y :: Number
  , dx :: Number
  , dy :: Number
}

type Pos r = { posX :: Number, posY :: Number | r }

type Vel r = { dx :: Number, dy :: Number | r }

type PosAndVal r = Pos ( foo :: String | r )

pos :: ∀ r. RowLacks "posX" r ⇒ RowLacks "posY" r
  ⇒ Number
  → Number
  → { | r }
  → Pos r
pos x y r = assign { posX: x, posY: y } r

stepTime :: ∀ r
  . Number
  → { posX :: Number, posY :: Number, dx :: Number, dy :: Number | r }
  → { posX :: Number, posY :: Number, dx :: Number, dy :: Number | r }
stepTime delta r =
  r { posX = r.posX + delta * r.dx
    , posY = r.posY + delta * r.dy
    }

ballLogic :: BallState → Signal Number → Signal BallState
ballLogic initial tact = foldp move initial tact
  where
    move :: Number → BallState → BallState
    move delta r =
      let
        stepX = r.x + (delta * r.dx)
        newDx = if 0.0 < stepX && stepX + 20.0 < 800.0 then r.dx else -r.dx
        stepY = r.y + (delta * r.dy)
        newDy = if 0.0 < stepY && stepY + 20.0 < 600.0 then r.dy else -r.dy
      in
      r { x = r.x + newDx * delta
        , y = r.y + newDy * delta
        , dx = newDx
        , dy = newDy
        }

balls :: Signal Number → Ref → Components String (Signal BallState)
balls tact ref = init "b1" { pixiRef: ref, x: 0.0, y: 0.0, dx: 3.0, dy: 3.5 }

main :: ∀ eff. Eff ( pixi :: PIXI, dom :: DOM | eff ) Unit
main = do
  node <- App.body
  app <- App.init App.defaults node
  tact <- App.tick app
  ref <- rect (App.stage app) (Color 0xFFFFFF) 20 20

  let
    initialState :: BallState
    initialState = { pixiRef: ref, x: 0.0, y: 0.0, dx: 3.0, dy: 5.0 }

    outSig :: ∀ e. Signal (Eff (pixi :: PIXI, dom :: DOM | e) Unit)
    outSig = updatePos <~ ballLogic initialState tact

  runSignal outSig
