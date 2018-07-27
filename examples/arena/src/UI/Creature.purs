module Example.Arena.UI.Creature
  ( renderPlayer
  ) where


import Prelude

import Alchemy.FRP.Event (Event)
import Alchemy.Graphics2d (Graphic)
import Alchemy.Graphics2d.Attributes (pos)
import Alchemy.Graphics2d.Shapes (defaultShape, defaultTextStyle, text)
import Data.Int (floor)
import Example.Arena.Types (Creature)
import Example.Arena.UI.Map (tileSize)

renderPlayer :: Event Creature -> Graphic
renderPlayer p =
  renderCreature "@" p


renderCreature :: String -> Event Creature -> Graphic
renderCreature icon c =
  text icon textStyle defaultShape [ posAttribute ]

  where textStyle = defaultTextStyle { fontSize = floor tileSize
                                     , fontFamily = "Courier"
                                     }

        posAttribute =
          pos $ (mapPos2ScreenPos <<< _.pos) <$> c

        mapPos2ScreenPos p =
          { x: tileSize * p.x + 10.0
          , y: tileSize * p.y + tileSize / 2.0
          }
