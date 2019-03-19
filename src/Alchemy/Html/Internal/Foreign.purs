module Alchemy.DOM.Internal.Foreign
  where


import Prelude

import Data.Either (Either(..))
import Data.Maybe (Maybe(..))
import Data.Traversable (traverse)
import Effect (Effect)
import Prim.Row as Row
import Prim.RowList (class RowToList, Cons, Nil, kind RowList)
import Record.Unsafe (unsafeGet, unsafeSet)
import Type.Prelude (class IsSymbol, RLProxy(..), SProxy(..), reflectSymbol)
import Unsafe.Coerce (unsafeCoerce)

foreign import data Node :: Type

foreign import data ForeignData :: Type

foreign import unsafeSetAttr ::
  ∀ a. String -> Node -> a -> (Effect Unit)

foreign import unsafeSetObjectProperty ::
  ∀ obj a. String -> obj -> a -> (Effect Unit)

foreign import createTextNode :: String -> Effect Node

foreign import createElement :: String -> Effect Node

foreign import appendChild :: Node -> Node -> Effect Unit

foreign import removeChild :: Node -> Node -> Effect Unit

foreign import unsafeAddEventHandler ::
  String -> (ForeignData -> Effect Unit) -> Node -> Effect (Effect Unit)


foreign import querySelectorImpl ::
  ∀ a. Maybe a -> (a -> Maybe a) -> String -> Effect (Maybe (Node))

querySelector :: String -> Effect (Maybe Node)
querySelector = querySelectorImpl Nothing Just


type F a = Either String a

type ForeignReader a = ReadForeign a => ForeignData -> Either String a

-- | Implementation strongly based on purescript-simple-json by justinwoo
-- | (https://github.com/justinwoo/purescript-simple-json)
read :: ∀ a. ReadForeign a => ForeignData -> Either String a
read = readImpl

class ReadForeign a where
  readImpl :: ForeignData -> Either String a

instance readNumber :: ReadForeign Number where
  readImpl = unsafeReadWhenTagged "number"

instance readInt :: ReadForeign Int where
  readImpl = unsafeReadWhenTagged "int"

instance readString :: ReadForeign String where
  readImpl = unsafeReadWhenTagged "string"

instance readBoolean :: ReadForeign Boolean where
  readImpl = unsafeReadWhenTagged "bool"

instance readArray :: ReadForeign a => ReadForeign (Array a) where
  readImpl = traverse readImpl <=< (unsafeReadWhenTagged "array")

instance readMaybe :: ReadForeign a => ReadForeign (Maybe a) where
  readImpl = readNullOrUndefined readImpl
    where
      readNullOrUndefined f value =
        if (getTag value) == "null"
          then Right Nothing
          else Just <$> f value

instance readRecord ::
  ( RowToList r rl
  , ReadForeignRL rl r
  ) => ReadForeign (Record r) where
  readImpl o =
    if getTag o == "object"
      then readRows (RLProxy :: RLProxy rl) o
      else Left $ "Type mismatch: expected 'object', found" <> (getTag o)

class ReadForeignRL (rl :: RowList) (to :: # Type) | rl -> to where
  readRows :: RLProxy rl -> ForeignData -> Either String (Record to)

instance readForeignRLCons ::
  ( IsSymbol l
  , Row.Cons l a rtail r
  , Row.Lacks  l rtail
  , ReadForeign a
  , ReadForeignRL rltail rtail
  ) => ReadForeignRL (Cons l a rltail) r where
  readRows _ obj = rest >>= readOneProp
    where
      readOneProp r =
        case readProp key obj of
          Left err -> Left ("Cannot read property " <> key <> ": " <> err)
          Right val -> Right (insert keyP val r)

      keyP = SProxy :: SProxy l
      key = reflectSymbol keyP
      tailP = RLProxy :: RLProxy rltail
      rest = readRows tailP obj

instance readForeignRLNil :: ReadForeignRL Nil () where
  readRows _ _ = Right {}

readProp :: ∀ a. ReadForeign a => String -> ForeignData -> Either String a
readProp key obj = readImpl (unsafeGet key (unsafeCoerce obj))


insert :: ∀ l a r rs
  . IsSymbol l => Row.Cons l a rs r => Row.Lacks l rs
 => SProxy l -> a -> Record rs -> Record r
insert l = unsafeSet (reflectSymbol l)


unsafeReadWhenTagged :: forall a. String -> ForeignData -> Either String a
unsafeReadWhenTagged tag value
  | getTag value == tag = Right (unsafeCoerce value)
  | otherwise =
    Left $ "Type mismatch: expected " <> tag <> ", found " <> (getTag value)

foreign import getTag :: ForeignData -> String
