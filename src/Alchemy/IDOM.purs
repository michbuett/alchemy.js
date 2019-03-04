module Alchemy.IDOM
  where


import Prelude

import Alchemy.DOM.Internals.Types (Node)
import Alchemy.DOM.Internals.Unsafe (appendChild, createElement, createTextNode, querySelector, removeChild, unsafeSetAttr, unsafeSetObjectProperty)
import Alchemy.Data.Increment.Value (IVal, delta, next, value)
import Alchemy.Data.Incremental (class Patchable, ArrayUpdate(..), Increment, fromChange)
import Alchemy.Data.Incremental.Atomic (new)
import Alchemy.Data.Observable (OVal, increments)
import Alchemy.FRP.Event (subscribe)
import Alchemy.FRP.Subscription (Subscription)
import Data.Array (catMaybes, length)
import Data.Array as Array
import Data.Maybe (Maybe(..), fromJust, fromMaybe)
import Data.Traversable (traverse, traverse_)
import Effect (Effect, foreachE)
import Effect.Console (error)
import Effect.Ref as Ref
import Partial.Unsafe (unsafePartial)


type UpdateFn a = Increment a -> Effect Unit

newtype Dom a =
  Dom (Node ->
    Effect { update :: Maybe (Increment a -> Effect Unit)
           , remove :: Effect Unit
           })


newtype DomList a =
  DomList (Node -> Effect (Maybe (Increment a -> Effect Unit)))


newtype Attribute a =
  Attribute (Node -> Effect (Maybe (Increment a -> Effect Unit)))


attr :: ∀ a b. String -> IVal a b -> Attribute a
attr name v0 = Attribute \n -> do
  vref <- Ref.new v0
  _ <- unsafeSetAttr name n (value v0)
  pure $ Just \a -> do
    v <- Ref.modify (next a) vref
    case delta v of
      Nothing -> pure unit
      Just _ -> unsafeSetAttr name n (value v)


attr_ :: ∀ a b. String -> b -> Attribute a
attr_ name v = Attribute \n -> do
  _ <- unsafeSetAttr name n v
  pure Nothing


className :: ∀ a. IVal a String -> Attribute a
className = attr "class"


className_ :: ∀ a. String -> Attribute a
className_ = attr_ "class"


inputType :: ∀ a. IVal a String -> Attribute a
inputType = attr "type"


inputType_ :: ∀ a. String -> Attribute a
inputType_ = attr_ "type"


placeholder :: ∀ a. IVal a String -> Attribute a
placeholder = attr "placeholder"


placeholder_ :: ∀ a. String -> Attribute a
placeholder_ = attr_ "placeholder"


id :: ∀ a. IVal a String -> Attribute a
id = attr "id"


id_ :: ∀ a. String -> Attribute a
id_ = attr_ "id"


for :: ∀ a. IVal a String -> Attribute a
for = attr "for"


for_ :: ∀ a. String -> Attribute a
for_ = attr_ "for"


checked :: ∀ a. IVal a Boolean -> Attribute a
checked = attr "checked"


checked_ :: ∀ a. Boolean -> Attribute a
checked_ = attr_ "checked"


text :: ∀ a. IVal a String -> Dom a
text v0 = Dom \pn -> do
  ref <- Ref.new v0
  tn <- createTextNode $ value v0
  appendChild pn tn
  pure { update:
        Just \a -> do
          v <- Ref.modify (next a) ref
          case delta v of
            Nothing -> pure unit
            Just dv -> unsafeSetObjectProperty "textContent" tn (new dv)

        , remove: removeChild pn tn
        }


text_ :: ∀ a. String -> Dom a
text_ txt = Dom \pn -> do
  tn <- createTextNode txt
  appendChild pn tn
  pure { update: Nothing, remove: removeChild pn tn }


element :: ∀ a. String -> Array (Attribute a) -> DomList a -> Dom a
element tag as (DomList cn) = Dom \p -> do
  n <- createElement tag
  updateAttributes <- initAttributes n
  updateChildren <- cn n
  appendChild p n
  pure { update: runBoth updateAttributes updateChildren
       , remove: removeChild p n
       }

  where
    initAttributes n = do
      fs <- traverse (\(Attribute f) -> f n) as
      let fs' = catMaybes fs
      pure if length fs' == 0
             then Nothing
             else Just (\a -> traverse_ (\f -> f a) fs')


    runBoth Nothing  Nothing  = Nothing
    runBoth (Just f) Nothing  = Just f
    runBoth Nothing  (Just g) = Just g
    runBoth (Just f) (Just g) =
      Just \a -> do
        f a
        g a


element_ :: ∀ a. String -> Array (Attribute a) -> Array (Dom a) -> Dom a
element_ tag as ds = element tag as (list_ ds)


div :: ∀ a. Array (Attribute a) -> DomList a -> Dom a
div = element "div"


div_ :: ∀ a. Array (Attribute a) -> Array (Dom a) -> Dom a
div_ = element_ "div"


label :: ∀ a. Array (Attribute a) -> DomList a -> Dom a
label = element "label"


label_ :: ∀ a. Array (Attribute a) -> Array (Dom a) -> Dom a
label_ = element_ "label"


h1 :: ∀ a. Array (Attribute a) -> DomList a -> Dom a
h1 = element "h1"


h1_ :: ∀ a. Array (Attribute a) -> Array (Dom a) -> Dom a
h1_ = element_ "h1"


inputText :: ∀ a. Array (Attribute a) -> DomList a -> Dom a
inputText as = element "input" (as <> [ inputType_ "text" ])


inputText_ :: ∀ a. Array (Attribute a) -> Array (Dom a) -> Dom a
inputText_ as ds = inputText as (list_ ds)


button :: ∀ a. Array (Attribute a) -> DomList a -> Dom a
button as = element "input" (as <> [ inputType_ "button" ])


button_ :: ∀ a. Array (Attribute a) -> Array (Dom a) -> Dom a
button_ as ds = button as (list_ ds)


checkbox :: ∀ a. Array (Attribute a) -> DomList a -> Dom a
checkbox as = element "input" (as <> [ inputType_ "checkbox" ])


checkbox_ :: ∀ a. Array (Attribute a) -> Array (Dom a) -> Dom a
checkbox_ as ds = checkbox as (list_ ds)


ul :: ∀ a. Array (Attribute a) -> DomList a -> Dom a
ul = element "ul"


ul_ :: ∀ a. Array (Attribute a) -> Array (Dom a) -> Dom a
ul_ = element_ "ul"


li :: ∀ a. Array (Attribute a) -> DomList a -> Dom a
li = element "li"


li_ :: ∀ a. Array (Attribute a) -> Array (Dom a) -> Dom a
li_ = element_ "li"


list :: ∀ a b db
  . Patchable b db
 => IVal a (Array b)
 -> (b -> Dom b)
 -> DomList a
list v0 createChild = DomList \p -> do
  vref <- Ref.new v0
  cn <- traverse (\b -> initChild (createChild b) p) (value v0)
  cref <- Ref.new cn
  let uc = updateChild p cref
  pure $ Just \a -> do
    v <- Ref.modify (next a) vref
    case delta v of
      Nothing -> pure unit
      Just db -> foreachE (fromChange db) (uc (value v))

  where
    initChild (Dom d) n = d n

    updateChild p r _ (InsertAt i b) = do
      cn <- initChild (createChild b) p
      _ <- Ref.modify (\cns -> fromMaybe cns $ Array.insertAt i cn cns) r
      pure unit

    updateChild _ r _ (DeleteAt i) = do
      cns <- Ref.read r
      case Array.index cns i of
        Nothing -> pure unit
        Just { remove } -> do
          _ <- Ref.modify (\arr -> fromMaybe arr $ Array.deleteAt i arr) r
          remove

    updateChild _ r bs (UpdateAt i db) = do
      cns <- Ref.read r
      case Array.index cns i >>= _.update of
        Nothing -> pure unit
        Just update ->
          update
            { new: unsafePartial $ fromJust (Array.index bs i)
            , delta: Just db
            }

list_ :: ∀ a. Array (Dom a) -> DomList a
list_ as = DomList \p -> do
  ds <- traverse (\(Dom d) -> d p) as
  let updates = catMaybes $ _.update <$> ds
  -- we can omit the remove part because the list itself never changes
  pure if length updates == 0
         then Nothing
         else Just (\a -> traverse_ (\f -> f a) updates)


render :: ∀ a. String -> OVal a -> Dom a -> Subscription
render sel ov (Dom renderDom) = do
  mn <- querySelector sel
  case mn of
    Nothing -> do
      error $ "Cannot find element '" <> sel <> "'"
      pure $ pure unit

    Just n -> do
      { update, remove } <- renderDom n
      case update of
        Nothing -> pure $ pure unit
        Just f -> do
          cancel <- subscribe (increments ov) f
          pure do
            remove
            cancel

