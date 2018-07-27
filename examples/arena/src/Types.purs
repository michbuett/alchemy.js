module Example.Arena.Types where

type Game =
  { player :: Creature
  , monsters :: Array Creature
  , viewport ::
    { offsetX :: Number
    , offsetY :: Number
    }
  }

type ArenaMap =
  Array (Array Tile)

data Tile =
  Floor | Wall

data EntityId =
  Player | Creature String

type Creature =
  { id :: EntityId
  , name :: String
  , fatigue :: Number
  , pain :: Number
  , stats ::
    { strength :: Int
    , constitution :: Int
    , intellect :: Int
    , agility :: Int
    }
  , armor :: Armor
  , weapon :: Weapon
  , pos ::
    { x :: Number
    , y :: Number
    }
  }

type Weapon =
  { name :: String
  , dice :: Int
  , modifier :: Int
  }

type Armor =
  Int
