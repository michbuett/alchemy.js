module Main where

import Prelude
import Control.Monad.Eff (Eff, kind Effect, foreachE)
import Control.Monad.Eff.Console (CONSOLE, log)
import Data.Symbol (SProxy(..))
import DOM (DOM)
import Control.Monad.ST (ST)
import Type.Row (RProxy(..))
import Data.Array (snoc)
import Data.Tuple
-- import Math (min, max)

import Alchemy.FRP.Stream
import Alchemy.FRP.Channel
import Alchemy.Entity.Storage
import Alchemy.Pixi (PIXI)
import Alchemy.Pixi.Application as App
import Alchemy.Pixi.Graphics as G
import Alchemy.DOM.Inferno as I
import Alchemy.DOM.KeyboardEvent (KeyEvent, keyup, keydown)


type V2 =
  { x :: Number, y :: Number }

data GameMode =
  Init | Running | P1Win | P2Win

type AppState =
  { mode :: GameMode
  , scoreP1 :: Int
  , scoreP2 :: Int
  }

type Components =
  ( pos :: V2
  , vel :: V2
  , dim :: V2
  , pixiRef :: G.Ref
  , vdom :: I.VDom ()
  , state :: AppState
  , oType :: ObstacleType
  )

pos = SProxy :: SProxy "pos"
vel = SProxy :: SProxy "vel"
dim = SProxy :: SProxy "dim"
pixiRef = SProxy :: SProxy "pixiRef"
vdom = SProxy :: SProxy "vdom"
state = SProxy :: SProxy "state"
oType = SProxy :: SProxy "oType"

type Collition =
  { collider :: Entity ( pos :: V2
                       , vel :: V2
                       , dim :: V2
                       , oType :: ObstacleType
                       )
  , collidee :: Entity ( pos :: V2
                       , dim :: V2
                       , oType :: ObstacleType
                       )
  }

data ObstacleType = Ball | Paddle | BankT | BankB | GoalL | GoalR


data InputMsg =
  StartNewGame
  | MovePlayer Number String
  | NoOp

foreign import logAny ::
  ∀ a eff. a → Eff ( console :: CONSOLE | eff ) Unit

p1 = EntityId "p1" :: EntityId
p2 = EntityId "p2" :: EntityId

fieldWidth = 600.0 :: Number
fieldHeight = 400.0 :: Number
paddleWidth = 20.0 :: Number
paddleHeight = 50.0 :: Number
borderSize = 5.0 :: Number
ballSize = 5.0 :: Number

-- ========================================
-- INIT

initialState :: AppState
initialState =
  { mode: Init
  , scoreP1: 0
  , scoreP2: 0
  }

initGameEntities :: ∀ eff h
  . App.Stage
  → Eff (pixi :: PIXI, st :: ST h | eff) (Storage Components)
initGameEntities s = do
  let white = G.Color 0xFFFFFF

  gBall <- G.circle s white ballSize
  gP1 <- G.rect s white paddleWidth paddleHeight
  gP2 <- G.rect s white paddleWidth paddleHeight
  gBorderTop <- G.rect s white fieldWidth borderSize
  gBorderBottom <- G.rect s white fieldWidth borderSize
  gBorderLeft <- G.rect s white borderSize (fieldHeight - 2.0 * borderSize)
  gBorderRight <- G.rect s white borderSize (fieldHeight - 2.0 * borderSize)

  empty (RProxy :: RProxy Components)
    # set
      { entityId: (EntityId "meta")
      , state: initialState
      , vdom: { vnode: renderVDom initialState , root: "#ui" }
      }

    >>= set
      { entityId: (EntityId "ball")
      , pixiRef: gBall
      , pos:
        { x: (fieldWidth - ballSize) / 2.0
        , y: (fieldHeight - ballSize) / 2.0
        }
      , vel: { x: 2.0 , y: 2.0 }
      , dim: { x: ballSize , y: ballSize }
      , oType: Ball
      }

    >>= set
      { entityId: p1
      , pixiRef: gP1
      , pos:
        { x: borderSize + 1.0
        , y: (fieldHeight - paddleHeight) / 2.0
        }
      , vel: { x: 0.0, y: 0.0 }
      , dim: { x: paddleWidth , y: paddleHeight }
      , oType: Paddle
      }

    >>= set
      { entityId: p2
      , pixiRef: gP2
      , pos:
        { x: fieldWidth - paddleWidth - borderSize - 1.0
        , y: (fieldHeight - paddleHeight) / 2.0
        }
      , vel: { x: 0.0, y: 0.0 }
      , dim: { x: paddleWidth , y: paddleHeight }
      , oType: Paddle
      }

    >>= set
      { entityId: EntityId "border-left"
      , pixiRef: gBorderLeft
      , pos: { x: 0.0 , y: borderSize }
      , dim: { x: borderSize , y: fieldHeight - 2.0 * borderSize }
      , oType: GoalL
      }

    >>= set
      { entityId: EntityId "border-right"
      , pixiRef: gBorderRight
      , pos: { x: fieldWidth - borderSize, y: borderSize }
      , dim: { x: borderSize , y: fieldHeight - 2.0 * borderSize }
      , oType: GoalR
      }

    >>= set
      { entityId: EntityId "border-top"
      , pixiRef: gBorderTop
      , pos: { x: 0.0, y: 0.0 }
      , dim: { x: fieldWidth , y: borderSize }
      , oType: BankT
      }

    >>= set
      { entityId: EntityId "border-bottom"
      , pixiRef: gBorderBottom
      , pos: { x: 0.0, y: fieldHeight - borderSize }
      , dim: { x: fieldWidth , y: borderSize }
      , oType: BankB
      }


-- ========================================
-- UPDATE

collitionDetection :: ∀ eff
  . Stream (Entity (pos :: V2, dim :: V2, vel :: V2, oType :: ObstacleType))
  → Stream (Entity (pos :: V2, dim :: V2, oType :: ObstacleType))
  → Stream (Array Collition)
collitionDetection moving obstacles =
  (prod moving obstacles) # foldrS check []
  where
        check (Tuple m o) collitionsSoFar =
          if intersect m o then
            snoc collitionsSoFar { collider: m
                                 , collidee: o
                                 }
          else
            collitionsSoFar

        intersect m o
          | m.entityId == o.entityId = false
          | m.pos.x + m.dim.x < o.pos.x = false
          | m.pos.x > o.pos.x + o.dim.x = false
          | m.pos.y + m.dim.y < o.pos.y = false
          | m.pos.y > o.pos.y + o.dim.y = false
          | otherwise = true


collitionResolution :: ∀ eff h
  . Channel InputMsg
  → Storage Components
  → Stream (Array Collition)
  → Stream (Eff (console :: CONSOLE, st :: ST h | eff) Unit)
collitionResolution inpChannel entities collitions =
  collitions <#> (\cs -> foreachE cs resolve)
  where bounceBall cr dx dy newX newY = void do
          set { entityId: cr.entityId
              , pos: { x: newX, y: newY }
              , vel: { x: cr.vel.x * dx, y: cr.vel.y * dy }
              } entities

        bouncePaddle cr newY = void do
          set { entityId: cr.entityId
              , pos: { x: cr.pos.x, y: newY }
              , vel: { x: 0.0, y: 0.0 }
              } entities

        logHit cr ce = do
          log ((show cr.entityId) <> " hits " <> (show ce.entityId))

        resolve c =
          let minX = borderSize + paddleWidth + 1.0
              maxX = fieldWidth - borderSize - paddleWidth - c.collider.dim.x - 1.0
              x = max minX $ min c.collider.pos.x maxX
              minY = borderSize
              maxY = fieldHeight - borderSize - c.collider.dim.y
              y = max minY $ min c.collider.pos.y maxY
          in case c.collider.oType, c.collidee.oType of
              Ball, Paddle ->
                bounceBall c.collider (-1.0) 1.0 x y
              Ball, BankT -> bounceBall c.collider 1.0 (-1.0) x y
              Ball, BankB -> bounceBall c.collider 1.0 (-1.0) x y
              Paddle, BankT -> bouncePaddle c.collider y
              Paddle, BankB -> bouncePaddle c.collider y
              _, _ -> logHit c.collider c.collidee


stepPos :: ∀ eff h
  . Storage Components
  → Number
  → Eff ( st :: ST h, console :: CONSOLE  | eff) Unit
stepPos store delta =
  access store # with pos # with vel # run (step delta)

step :: ∀ r
  . Number
  → { pos :: V2, vel :: V2 | r }
  → { pos :: V2, vel :: V2 | r }
step delta r =
  r { pos =
      { x: r.pos.x + delta * r.vel.x
      , y: r.pos.y + delta * r.vel.y
      }
  }

handleKeys :: ∀ eff
  . Channel InputMsg
  → KeyEvent
  → Eff (frp :: FRP | eff) Unit
handleKeys inp ev =
  foreachE (messages ev.code) (send inp)
    where messages code =
            if code == "Space" then
              [StartNewGame]
            else if code == "KeyQ" then
              [(MovePlayer (-1.0) "p1")]
            else if code == "KeyA" then
              [(MovePlayer 1.0 "p1")]
            else if code == "ArrowUp" then
              [(MovePlayer (-1.0) "p2")]
            else if code == "ArrowDown" then
              [(MovePlayer 1.0 "p2")]
            else
              []

handleKeyDown :: ∀ h e
  . Storage Components
  → Stream (KeyEvent → Eff (st :: ST h | e) Unit)
handleKeyDown es =
  access es # with state # read <#> handle
  where moveUp p =
          void $ set { entityId: p, vel: { x: 0.0, y: -8.0 } } es

        moveDown p =
          void $ set { entityId: p, vel: { x: 0.0, y: 8.0 } } es

        handle globalE ev =
          case globalE.state.mode of
               Running | ev.code == "KeyQ" -> moveUp p1
                       | ev.code == "KeyA" -> moveDown p1
                       | ev.code == "ArrowUp" -> moveUp p2
                       | ev.code == "ArrowDown" -> moveDown p2
                       | otherwise -> pure unit

               _ | ev.code == "Space" -> updateAppState es StartNewGame
                 | otherwise -> pure unit

handleKeyUp :: ∀ h e
  . Storage Components
  → Stream (KeyEvent → Eff (st :: ST h | e) Unit)
handleKeyUp es =
  access es # with state # read <#> handle
  where stopMoving p =
          void $ set { entityId: p, vel: { x: 0.0, y: 0.0 } } es

        handle globalE ev =
          case globalE.state.mode of
               Running | ev.code == "KeyQ" -> stopMoving p1
                       | ev.code == "KeyA" -> stopMoving p1
                       | ev.code == "ArrowUp" -> stopMoving p2
                       | ev.code == "ArrowDown" -> stopMoving p2
                       | otherwise -> pure unit

               _ -> pure unit

processInput :: ∀ h eff
  . Storage Components
  → InputMsg
  → Eff ( st :: ST h, frp :: FRP, console :: CONSOLE | eff) Unit
processInput s (MovePlayer v p) =
  access s # with vel # whereId (EntityId p) # run setVelocity
    where setVelocity e =
            e { vel = { x: 0.0, y: v * 7.0 }}

processInput s msg =
  updateAppState s msg


updateAppState :: ∀ h eff
  . Storage Components
  → InputMsg
  → Eff ( st :: ST h | eff) Unit
updateAppState store msg =
  access store # with state # with vdom # run start
    where start e =
            e { state = s
              , vdom { vnode = renderVDom s }
              }
              where s = update msg e.state


update ::
  InputMsg → AppState → AppState
update StartNewGame _ =
  { mode: Running
  , scoreP1: 0
  , scoreP2: 0
  }
update _ s = s



-- ========================================
-- VIEW

renderVDom :: AppState → I.VNode
renderVDom st =
  I.div []
    [ I.div [ I.id "score" ]
      [ I.text ((show st.scoreP1) <> " : " <> (show st.scoreP2)) ]
    , renderInfo st.mode
    ]
    where renderInfo :: GameMode → I.VNode
          renderInfo Init =
            renderInfoMsg "Welcome to PS-Pong!" "Press [Space] to start"
          renderInfo Running =
            I.div [] []
          renderInfo P1Win =
            renderInfoMsg "Player 1 wins!" "Press [Space] to restart"
          renderInfo P2Win =
            renderInfoMsg "Player 2 wins!" "Press [Space] to restart"

          renderInfoMsg :: String → String → I.VNode
          renderInfoMsg title subtitle =
            I.div [ I.id "info-msg" ]
              [ I.div [ I.className "title" ] [ I.text title]
              , I.div [ I.className "title" ] [ I.text subtitle]
              ]

getVDomStream :: ∀ eff.
  Storage Components -> Stream (Eff (dom :: DOM | eff) Unit)
getVDomStream store =
  access store # with vdom # read <#> renderDom

renderDom :: ∀ a eff
  . Entity (vdom :: I.VDom a)
  → Eff (dom :: DOM | eff) Unit
renderDom e =
  I.render e.vdom

getPixiPosStream :: ∀ eff.
  Storage Components → Stream (Eff (pixi :: PIXI | eff) Unit)
getPixiPosStream store =
  access store # with pos # with pixiRef # read <#> updatePos

updatePos :: ∀ eff
  . Entity (pos :: V2, pixiRef :: G.Ref)
  → Eff (pixi :: PIXI | eff) Unit
updatePos entity = G.setPos p
  where p = { pixiRef: entity.pixiRef
            , x: entity.pos.x
            , y: entity.pos.y
            }


-- ========================================
-- MAIN

main :: ∀ eff h.
  Eff ( frp :: FRP
      , frp :: FRP
      , st :: ST h
      , console :: CONSOLE
      , pixi :: PIXI
      , dom :: DOM
      | eff ) Unit
main = do
  let options = App.defaults { width = 600, height = 400 }

  inpChannel <- channel
  keyd <- keydown
  keyu <- keyup
  app <- App.init options "#field"
  animationFrame <- App.tick app
  entities <- initGameEntities (App.stage app)
  e <- get (RProxy :: RProxy ( state :: AppState )) entities
  -- _ <- subscribe (handleKeys inpChannel) keyd
  _ <- sampleBy (handleKeyDown entities) keyd
  _ <- sampleBy (handleKeyUp entities) keyu
  _ <- subscribe (processInput entities) inpChannel
  _ <- subscribe (stepPos entities) animationFrame
  _ <- sample (
    (collitionDetection
      (access entities # with pos # with vel # with dim # with oType # read)
      (access entities # with pos # with dim # with oType # read))
    # (collitionResolution inpChannel entities)) animationFrame
  _ <- sample (getVDomStream entities) animationFrame
  sample (getPixiPosStream entities) animationFrame
