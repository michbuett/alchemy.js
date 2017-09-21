module Player
  ( State
  , Input
  , Key
  , update
  ) where

import Prelude ((-), (*), (+), (<), Unit)
import Control.Monad.Eff (Eff)
import Data.Int (toNumber)
import Field (height) as Field
import Alchemy.Pixi (PIXI)
import Alchemy.Pixi.Stage (Stage)
import Alchemy.Pixi.Graphics (Color(..), rect)

data Key = Up | Down | None

type Input =
  { timeDelta :: Number
  , key :: Key
  , scored :: Boolean
}

type State =
  { id :: String
  , x :: Number
  , y :: Number
  , score :: Int
}

update :: Input → State → State
update inp st =
  st { y = stepPlayerPos inp.key inp.timeDelta st.y
     , score = stepPlayerScore inp.scored st.score
  }
    where
      stepPlayerPos :: Key → Number → Number → Number
      stepPlayerPos Up timeDelta y = lowerbound (y - timeDelta * 100.0)
      stepPlayerPos Down timeDelta y = upperbound (y + timeDelta * 100.0)
      stepPlayerPos None _ y = y

      stepPlayerScore :: Boolean → Int → Int
      stepPlayerScore scored score = if scored then score + 1 else score

      lowerbound :: Number → Number
      lowerbound n = if 0.0 < n then n else 0.0

      upperbound :: Number → Number
      upperbound n =
        let max = toNumber Field.height in
        if n < max then n else max

render :: Stage → State → Eff ( pixi :: PIXI ) Unit
render stage state =
  let color = Color 0xFFFFFF in
  rect stage state.id color 20 100
