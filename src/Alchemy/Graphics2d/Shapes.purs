module Alchemy.Graphics2d.Shapes
  ( Shape
  , Circle
  , Rect
  , defaultCircleProps
  , defaultRectProps
  , circle
  , rect
  ) where

import Alchemy.Graphics2d (Graphic)
import Alchemy.Graphics2d.Attributes (Attr)
import Alchemy.Graphics2d.Colors (Color(..))

type Shape s =
  { xpos :: Number
  , ypos :: Number
  , alpha :: Number
  | s }

type Circle =
  Shape ( radius :: Number
        , fillColor :: Color
        )

defaultCircleProps :: Circle
defaultCircleProps =
  { xpos: 0.0
  , ypos: 0.0
  , alpha: 1.0
  , radius: 0.0
  , fillColor: Color 0xFFFFFF
  }

foreign import circle ::
  Circle → Array Attr → Graphic

type Rect =
  Shape ( width :: Number
        , height :: Number
        , fillColor :: Color
        )

defaultRectProps :: Rect
defaultRectProps =
  { xpos: 0.0
  , ypos: 0.0
  , alpha: 1.0
  , width: 0.0
  , height: 0.0
  , fillColor: Color 0xFFFFFF
  }

foreign import rect ::
  Rect → Array Attr → Graphic

