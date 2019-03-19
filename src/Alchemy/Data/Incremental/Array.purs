module Alchemy.Data.Incremental.Array
   ( cons
   , snoc
   , uncons
   , unsnoc
   , updateAt
   , mapp
   , filter
   ) where

import Prelude

import Alchemy.Data.Incremental (Increment, Patch(..))
import Alchemy.Data.Incremental.Types (class Patchable, ArrayUpdate(..), toChange)
import Data.Array as Array
import Data.Maybe (Maybe(..), fromJust)
import Partial.Unsafe (unsafePartial)



-- | Attaches an element to the front of an array, creating a new array.
cons :: ∀ a da. Patchable a da => a -> Patch (Array a)
cons newItem = Patch \arr ->
  { new: Array.cons newItem arr
  , delta: Just $ toChange [InsertAt 0 newItem]
  }


-- | Append an element to the end of an array, creating a new array.
snoc :: ∀ a da. Patchable a da => a -> Patch (Array a)
snoc newItem = Patch \arr ->
  { new: Array.snoc arr newItem
  , delta: Just $ toChange [InsertAt (Array.length arr) newItem]
  }


-- | Removes the first element of an array
uncons :: ∀ a da. Patchable a da => Patch (Array a)
uncons = Patch runPatch
  where
  runPatch arr =
    case Array.uncons arr of
      Nothing ->
        { new: arr, delta: Nothing }
      Just { tail } ->
        { new: tail, delta: Just $ (toChange [DeleteAt 0]) }


-- | Removes the last element of an array
unsnoc :: ∀ a da. Patchable a da => Patch (Array a)
unsnoc = Patch \arr ->
  case Array.unsnoc arr of
    Nothing ->
      { new: arr, delta: Nothing }
    Just { init } ->
      { new: init, delta: Just $ toChange [DeleteAt $ Array.length init] }


updateAt :: ∀ a da. Patchable a da =>
  Int -> (a -> Increment a) -> Patch (Array a)
updateAt i f = Patch \arr ->
  case Array.index arr i of
    Nothing -> { new: arr, delta: Nothing }
    Just x ->
      case f x :: Increment a of
        { delta: Nothing } -> { new: arr, delta: Nothing }
        { new, delta: Just dx } ->
          { new: unsafePartial fromJust (Array.updateAt i new arr)
          , delta: Just $ toChange [ UpdateAt i dx ]
          }


mapp :: ∀ a da. Patchable a da => (a -> Increment a) -> Patch (Array a)
mapp f = Patch \arr ->
  Array.foldl mapOne { new: [], delta: Nothing } arr
  where
    mapOne { new, delta } a =
      let ia = f a
          idx = Array.length new
          new' = Array.snoc new ia.new
       in
      case ia.delta of
        Nothing -> { new: new', delta }
        Just da ->
          { new: Array.snoc new ia.new
          , delta: delta <> (Just $ toChange [ UpdateAt idx da ])
          }


filter :: ∀ a da. Patchable a da => (a -> Boolean) -> Patch (Array a)
filter f = Patch \arr ->
  Array.foldl filterOne { new: [], delta: Nothing } arr
  where
    filterOne { new, delta } a =
      if f a
        then { new: Array.snoc new a, delta }
        else
          { new
          , delta: delta <> (Just $ toChange [ DeleteAt $ Array.length new ])
          }
