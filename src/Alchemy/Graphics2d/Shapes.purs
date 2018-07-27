module Alchemy.Graphics2d.Shapes
  ( Shape
  , TextStyle
  , defaultShape
  , defaultTextStyle
  , circle
  , rect
  , text
  ) where

import Alchemy.Graphics2d (Graphic)
import Alchemy.Graphics2d.Attributes (Attr)
import Alchemy.Graphics2d.Colors (Color(..))

type Shape =
  { xpos :: Number
  , ypos :: Number
  , alpha :: Number
  , fillColor :: Color
  , lineWidth :: Int
  , lineColor :: Color
  , lineAlpha :: Int
  }


defaultShape :: Shape
defaultShape =
  { xpos: 0.0
  , ypos: 0.0
  , alpha: 1.0
  , fillColor: Color 0xFFFFFF
  , lineWidth: 0
  , lineColor: Color 0x000000
  , lineAlpha: 1
  }

type TextStyle =
  { fontFamily :: String
  , fontSize :: Int
  }

defaultTextStyle :: TextStyle
defaultTextStyle =
  { fontFamily: "Arial"
  , fontSize: 26
  }

foreign import circle ::
  Number → Shape → Array Attr → Graphic

foreign import rect ::
  Number → Number → Shape → Array Attr → Graphic

foreign import text ::
  String → TextStyle → Shape → Array Attr → Graphic
