module Example.Arena.UI.Scene where

import Prelude

import Alchemy.FRP.Event (Event)
import Alchemy.Graphics2d (Graphic)
import Alchemy.Graphics2d.Container (box)
import Example.Arena.Types (ArenaMap, Game)
import Example.Arena.UI.Creature (renderPlayer)
import Example.Arena.UI.Map (renderTileMap)

renderScene ::
  ArenaMap → Event Game → Graphic
renderScene m g =
  box [ renderTileMap m
      , renderPlayer $ _.player <$> g
      ]
