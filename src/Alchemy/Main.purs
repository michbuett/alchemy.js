module Main
  where

import Alchemy.Data.Incremental2
import Alchemy.Data.Storage
import Alchemy.FRP.Event
import Prelude

import Effect (Effect)

-- setValue :: String -> Atomic String -> Change (Atomic String) (AtomicUpdate String)
-- setValue s _ = changeAtomic s

-- store ::
--   Storage { foo :: Storage (Atomic String)
--           , bar :: Storage (Atomic String)
--           , baz :: Storage { bla :: Storage (Atomic Number), blub :: Storage (Atomic String) }
-- }
store ::
  Storage { foo :: Atomic String
          , bar :: Atomic String
          , baz :: { bla :: Atomic Number
                   , blub :: Atomic String
                   }
          }
store =
  storeRecord $
    { foo: storeAtomic $ Atomic "Foo"
    , bar: storeAtomic $ Atomic "Bar"
    , baz: storeRecord $
      { bla: storeAtomic $ Atomic 42.42
      , blub: storeAtomic $ Atomic "BLBL"
      }
    }

change =
  changeRecord $ { foo: changeAtomic "FOOFOO"
                 , baz: changeRecord $ { blub: changeAtomic "BLAAA BLAA" }
                 }


main :: Effect Unit
main = do
  _ <- subscribe (values store) debug
  -- modify (setValue "Bar") store
  modify (\_ -> change) store
