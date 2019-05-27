module Main
  where

import Prelude

import Effect (Effect)

import Alchemy.FRP.Event (foldp)
import Alchemy.FRP.Time (tick)
import Gfx2d.Foreign.Renderer (Graphic, RenderConfig, render)
import Gfx2d.Foreign.Sprite (cmap, list, sprite, xpos, ypos, image)

type State =
  { s1 ::
    { x :: Number, y :: Number, dx :: Number, dy :: Number }
  , s2 ::
    { x :: Number, y :: Number, dx :: Number, dy :: Number }
  , s3 ::
    { x :: Number, y :: Number, dx :: Number, dy :: Number }
  }

initialState :: State
initialState =
  { s1: { x: 100.0, y: 100.0, dx: 5.0, dy: 5.0 }
  , s2: { x: 200.0, y: 100.0, dx: -5.0, dy: -1.0 }
  , s3: { x: 150.0, y: 200.0, dx: 1.0, dy: -3.0 }
  }


renderCfg :: RenderConfig
renderCfg =
  { width: 400
  , height: 300
  , selector: "body"
  }


update :: Number -> State -> State
update _ s =
  { s1: updateOne s.s1
  , s2: updateOne s.s2
  , s3: updateOne s.s3
  }

  where
    updateOne o =
      let dx = if o.x + o.dx <= 700.0 && o.x + o.dx >= 0.0 then o.dx else -o.dx
          dy = if o.y + o.dy <= 500.0 && o.y + o.dy >= 0.0 then o.dy else -o.dy
          x = o.x + dx
          y = o.y + dy
       in { x, y, dx, dy }



view :: State -> Graphic State
view s =
  list
  [ sprite
    { xpos: s.s1.x
    , ypos: s.s1.y
    , width: 100.0
    , height: 100.0
    , texture: image "img/star.jpg"
    } [ cmap _.s1.x xpos , cmap _.s1.y ypos ]
  , sprite
    { xpos: s.s2.x
    , ypos: s.s2.y
    , width: 100.0
    , height: 100.0
    , texture: image "img/leaves.jpg"
    } [ cmap _.s2.x xpos , cmap _.s2.y ypos ]
  , sprite
    { xpos: s.s3.x
    , ypos: s.s3.y
    , width: 100.0
    , height: 100.0
    , texture: image "img/keyboard.jpg"
    } [ cmap _.s3.x xpos , cmap _.s3.y ypos ]
  ]

main :: Effect Unit
main = do
  tact <- tick
  let stateE = foldp update initialState tact
  _ <- render renderCfg stateE (view initialState)
  pure unit
