module Alchemy.Html
  ( Html
  , Attribute
  , attribute
  , property
  , on
  , on'
  , text
  , element
  , bindText
  , bindList
  , bindProp
  , render
  ) where


import Prelude

import Alchemy.DOM.Internal.Foreign (F, ForeignData, Node, appendChild, createElement, createTextNode, removeChild, unsafeAddEventHandler, unsafeSetAttr, unsafeSetObjectProperty)
import Alchemy.Data.Increment.Value (IVal, delta, next, value)
import Alchemy.Data.Incremental (class Patchable, ArrayUpdate(..), Increment, fromChange)
import Alchemy.Data.Incremental.Atomic (new)
import Alchemy.Data.Observable (OVal, increments)
import Alchemy.FRP.Event (subscribe)
import Alchemy.FRP.Subscription (Subscription)
import Data.Array (catMaybes, length)
import Data.Array as Array
import Data.Either (Either(..))
import Data.Maybe (Maybe(..), fromJust, fromMaybe)
import Data.Traversable (traverse, traverse_)
import Effect (Effect, foreachE)
import Effect.Console (error)
import Effect.Ref as Ref
import Partial.Unsafe (unsafePartial)


newtype Html a =
  Html (Node -> Effect
                  { node :: Node
                  , update :: DomUpdate a
                  , remove :: Effect Unit
                  })


type DomUpdate a =
  Maybe (Increment a -> Effect Unit)


data Attribute a
  = Attribute String (Node -> Effect (DomUpdate a))
  | Property String (Node -> Effect (DomUpdate a))
  | EventListener String (Node -> Effect (DomUpdate a))


-- | Create attributes, like saying `domNode.setAttribute('class', 'greeting')`
-- | in JavaScript.
attribute :: ∀ a b. String -> b -> Attribute a
attribute name v = Attribute name \n -> do
  unsafeSetAttr name n v
  pure Nothing


-- | Create properties, like saying `domNode.className = 'greeting'`
-- | in JavaScript.
property :: ∀ a b. String -> b -> Attribute a
property name v = Property name $ \n -> do
  unsafeSetObjectProperty name n v
  pure Nothing


-- | A general way to create eventl listeners
on :: ∀ a b. String -> (ForeignData -> F a) -> (a -> Effect Unit) -> Attribute b
on eventName decode handler = EventListener eventName \n -> do
  let impl = createEventHandler decode handler
  _ <- unsafeAddEventHandler eventName impl n
  pure Nothing


-- | Creates a simplified event listener which ignores the event data
on' :: ∀ a. String -> Effect Unit -> Attribute a
on' eventName eff = on eventName Right \_ -> eff


-- | Binds the value of an attribute to an incremental value (potentially
-- | overriding previous data bindings)
-- | NOTE: The binding of event handlers is not supported yet!
bindProp :: ∀ a b c. (a -> Attribute b) -> IVal (Increment c) a -> Attribute c
bindProp createAttr v0 =
  bindPropImpl $ createAttr (value v0)
  where
    bindPropImpl :: Attribute b -> Attribute c
    bindPropImpl (Attribute name _) = Attribute name \n -> do
      vref <- Ref.new v0
      unsafeSetAttr name n (value v0)
      pure $ Just \a -> do
        v <- Ref.modify (next a) vref
        case delta v of
          Nothing -> pure unit
          Just _ -> unsafeSetAttr name n (value v)

    bindPropImpl (Property name _) = Property name \n -> do
      vref <- Ref.new v0
      unsafeSetObjectProperty name n (value v0)
      pure $ Just \a -> do
        v <- Ref.modify (next a) vref
        case delta v of
          Nothing -> pure unit
          _ -> unsafeSetObjectProperty name n (value v)

    bindPropImpl (EventListener name el) = EventListener name \n -> do
      error "The binding of event listeners is not implemented yet!"
      _ <- el n
      pure Nothing


-- | Creates a plain text node
text :: ∀ a. String -> Html a
text txt = Html \pn -> do
  tn <- createTextNode txt
  appendChild pn tn
  pure { node: tn, update: Nothing, remove: removeChild pn tn }


-- | Binds a text node to an incremental value so if the value changes then the
-- | text will be updated
bindText :: ∀ a b. (String -> Html a) -> IVal (Increment b) String -> Html b
bindText createTxt v0 = Html \p -> do
  let Html html = createTxt $ value v0
  ref <- Ref.new v0
  { node, remove } <- html p
  pure { node, remove
       , update: Just \a -> do
           v <- Ref.modify (next a) ref
           case delta v of
             Nothing -> pure unit
             Just dv -> unsafeSetObjectProperty "textContent" node (new dv)
       }


-- | General way to create HTML nodes. It is used to define all of the helper
-- | functions in this library.
element :: ∀ a. String -> Array (Attribute a) -> Array (Html a) -> Html a
element tag as cs = Html \p -> do
  n <- createElement tag
  attr <- initAttributes as n
  children <- initChildren cs n
  appendChild p n
  pure { node: n
       , update: runBoth attr children
       , remove: removeChild p n
       }


bindList :: ∀ a b db
  . Patchable b db
 => (Array (Html a) -> Html a)
 -> IVal (Increment a) (Array b)
 -> (b -> Html b)
 -> Html a
bindList createEl val createChild = Html \n -> do
  let (Html html) = createEl []
  { node, update, remove } <- html n
  updateChildren <- list' val createChild node
  pure { node, remove, update: runBoth update updateChildren }


render :: ∀ a. Node -> OVal a -> Html a -> Subscription
render n ov (Html renderDom) = do
  { update, remove } <- renderDom n
  case update of
    Nothing -> pure $ pure unit
    Just f -> do
      cancel <- subscribe (increments ov) f
      pure do
        remove
        cancel


------------------------------------------------------------
------------------------------------------------------------
-- PRIVATE HELPER

list' :: ∀ a b db
  . Patchable b db
 => IVal (Increment a) (Array b)
 -> (b -> Html b)
 -> Node
 -> Effect (DomUpdate a)
list' v0 createChild p = do
  vref <- Ref.new v0
  cn <- traverse (\b -> initChild (createChild b) p) (value v0)
  cref <- Ref.new cn
  let uc = updateChild cref
  pure $ Just \a -> do
    v <- Ref.modify (next a) vref
    -- debugLog "update list" (delta v)
    case delta v of
      Nothing -> pure unit
      Just db -> foreachE (fromChange db) (uc (value v))

  where
    initChild (Html d) n = d n

    updateChild r _ (InsertAt i b) = do
      -- debugLog ("update list > insert at" <> show i) b
      cn <- initChild (createChild b) p
      _ <- Ref.modify (\cns -> fromMaybe cns $ Array.insertAt i cn cns) r
      pure unit

    updateChild r _ (DeleteAt i) = do
      -- debugLog ("update list > delete at" <> show i) Nothing
      cns <- Ref.read r
      case Array.index cns i of
        Nothing -> pure unit
        Just { remove } -> do
          _ <- Ref.modify (\arr -> fromMaybe arr $ Array.deleteAt i arr) r
          remove

    updateChild r bs (UpdateAt i db) = do
      -- debugLog ("update list > update at" <> show i) db
      cns <- Ref.read r
      case Array.index cns i >>= _.update of
        Nothing -> pure unit
        Just update ->
          update
            { new: unsafePartial $ fromJust (Array.index bs i)
            , delta: Just db
            }


createEventHandler :: ∀ a
  . (ForeignData -> F a)
 -> (a -> Effect Unit)
 -> ForeignData
 -> Effect Unit
createEventHandler decode f e = do
  case decode e of
    Left err -> error err
    Right a -> f a


initChildren :: ∀ a. Array (Html a) -> Node -> Effect (DomUpdate a)
initChildren as p = do
  ds <- traverse (\(Html d) -> d p) as
  let updates = catMaybes $ _.update <$> ds
  -- we can omit the remove part because the list itself never changes
  pure if length updates == 0
         then Nothing
         else Just (\a -> traverse_ (\f -> f a) updates)


initAttributes :: ∀ a. Array (Attribute a) -> Node -> Effect (DomUpdate a)
initAttributes as n = do
  fs <- traverse createDomUpdate as
  let fs' = catMaybes fs
  pure if length fs' == 0
         then Nothing
         else Just (\a -> traverse_ (\f -> f a) fs')

  where
    createDomUpdate (Attribute _ f) = f n
    createDomUpdate (Property _ f) = f n
    createDomUpdate (EventListener _ f) = f n


runBoth :: ∀ a
  . Maybe (a -> Effect Unit)
 -> Maybe (a -> Effect Unit)
 -> Maybe (a -> Effect Unit)
runBoth Nothing  Nothing  = Nothing
runBoth (Just f) Nothing  = Just f
runBoth Nothing  (Just g) = Just g
runBoth (Just f) (Just g) =
  Just \a -> do
    f a
    g a
