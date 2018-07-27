module Example.Arena.UI.Map
  ( renderTileMap
  , tileSize
  ) where

import Prelude

import Alchemy.Graphics2d (Graphic)
import Alchemy.Graphics2d.Colors (Color(..))
import Alchemy.Graphics2d.Container (box)
import Alchemy.Graphics2d.Shapes (defaultShape, rect)
import Data.Array (foldr, mapWithIndex)
import Data.Int (toNumber)
import Example.Arena.Types (ArenaMap, Tile(..))

renderTileMap :: ArenaMap -> Graphic
renderTileMap m =
  box $ foldr (<>) [] (mapWithIndex renderRow m)

renderRow :: Int -> Array Tile -> Array Graphic
renderRow r tiles =
  mapWithIndex renderTile tiles

  where renderTile :: Int -> Tile -> Graphic
        renderTile c Floor =
          drawTile c r (Color 0xF0F1F2)
        renderTile c Wall =
          drawTile c r (Color 0x838180)


drawTile :: Int → Int → Color → Graphic
drawTile column row color =
  let xpos = (toNumber column) * tileSize
      ypos = (toNumber row) * tileSize
      shape = defaultShape { fillColor = color
                           , lineWidth = 1
                           , lineColor = Color 0xA3A1A0
                           , xpos = xpos
                           , ypos = ypos
                           }
   in rect tileSize tileSize shape []


tileSize :: Number
tileSize = 50.0
