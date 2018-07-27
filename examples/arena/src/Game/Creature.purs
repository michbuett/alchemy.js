module Example.Arena.Game.Creature where

import Prelude
import Effect (Effect)
import Example.Arena.Types (EntityId(..), Creature)

createPlayer :: Number → Number → Effect Creature
createPlayer xpos ypos =
  pure { id: Player
       , name: "Da Playa"
       , fatigue: 0.0
       , pain: 0.0
       , stats:
         { strength: 10
         , constitution: 10
         , intellect: 10
         , agility: 10
         }
       , weapon:
         { name: "Fists"
         , dice: 2
         , modifier: 0
         }
       , armor: 10
       , pos: { x: xpos, y: ypos }
       }


createMonster :: Effect Creature
createMonster =
  pure { id: Creature "foo"
       , name: "Gruesome Monster"
       , fatigue: 0.0
       , pain: 0.0
       , stats:
         { strength: 10
         , constitution: 10
         , intellect: 10
         , agility: 10
         }
       , weapon:
         { name: "Fists"
         , dice: 2
         , modifier: 0
         }
       , armor: 10
       , pos: { x: 0.0, y: 0.0 }
       }
