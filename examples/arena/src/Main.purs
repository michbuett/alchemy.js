module Main where

-- [x] Render empty map
-- [x] Render player
-- [ ] allow moving the player
-- [ ] add (static) monsters
-- [ ] simple combat
-- [ ] simple AI for monsters
-- [ ] start and end (score) screen


import Prelude

import Alchemy.FRP.Subscription (together)
import Alchemy.Graphics2d (Options, defaults, render) as Gfx
import Data.Int (toNumber)
import Effect (Effect)
import Example.Arena.Game.Creature (createPlayer)
import Example.Arena.Game.Map (createTileMap, mapHeight, mapWidth)
import Example.Arena.Types (Game, ArenaMap)
import Example.Arena.UI.Scene (renderScene)

gameOptions :: Gfx.Options
gameOptions = Gfx.defaults { width = 800, height = 600 }

initGame :: ArenaMap → Effect Game
initGame arenaMap = do
  let x = (toNumber $ mapWidth arenaMap) / 2.0
      y = (toNumber $ mapHeight arenaMap) / 2.0

  player <- createPlayer x y
  pure { player: player
       , monsters: []
       , viewport:
         { offsetX: 0.0
         , offsetY: 0.0
         }
       }


main :: Effect Unit
main = do
  arenaMap <- createTileMap
  game <- initGame arenaMap
  void $ together [ Gfx.render gameOptions "#field" (renderScene arenaMap (pure game))
                  ]
