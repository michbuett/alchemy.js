module Example.Todo.Main where

import Prelude hiding (div)

import Alchemy.DOM.Internal.Foreign (querySelector)
import Alchemy.Data.Increment.Value as IVal
import Alchemy.Data.Incremental (class Patchable, AtomicUpdate, Patch, liftValue, noop, runPatch)
import Alchemy.Data.Incremental.Array (filter, mapp, snoc)
import Alchemy.Data.Incremental.Atomic (set)
import Alchemy.Data.Incremental.Atomic as Atomic
import Alchemy.Data.Incremental.Record (assign, assign')
import Alchemy.Data.Incremental.Record as Rec
import Alchemy.Data.Observable as OVal
import Alchemy.FRP.Event (Sender)
import Alchemy.Html (Html, bindList, bindProp, bindText, render, text)
import Alchemy.Html.Attribute (checked, className, for, id, placeholder, value)
import Alchemy.Html.Element (button, checkbox, div, h1, inputText, label, li, ul)
import Alchemy.Html.Event (onCheck, onClick, onInput, onKeydown)
import Data.Maybe (Maybe(..))
import Effect (Effect)
import Effect.Console (error)
import Type.Prelude (SProxy(..))

newtype ID = ID Int
derive instance eqID :: Eq ID
instance patchableID :: Patchable ID (AtomicUpdate ID)

data UserInput
  = NewTodoEdit String
  | NewTodoCommit
  | NewTodoCancel
  | ToggleCompleted ID
  | RemoveTodo ID

type ToDo =
  { id :: ID
  , text :: String
  , isCompleted :: Boolean
  }

type AppState =
  { todos :: Array ToDo
  , field :: String
  , lastId :: ID
  }


update :: UserInput -> Patch AppState
update (NewTodoEdit text) =
  assign { field: set text }

update NewTodoCommit =
  assign' $ \{ field, lastId: ID lastId } ->
    if field == "" then noop
      else
        let newId = ID (lastId + 1)
         in assign
          { todos: snoc { id: newId, text: field, isCompleted: false }
          , field: set ""
          , lastId: set newId
          }

update NewTodoCancel =
  assign { field: set "" }

update (ToggleCompleted id) =
  assign { todos: mapp toggle }
  where
    toggle todo =
      if todo.id /= id
        then liftValue todo
        else runPatch (assign { isCompleted: set $ not todo.isCompleted }) todo

update (RemoveTodo id) =
  assign { todos: filter \t -> t.id /= id }


view :: Sender UserInput -> AppState -> Html AppState
view send state =
  div [ className "todoapp" ]
    [ viewHeader send state
    , viewTodos send state
    ]


viewHeader :: Sender UserInput -> AppState -> Html AppState
viewHeader send state =
  div
    [ className "header" ]
    [ h1 [] [ text "todos" ]
    , inputText
      [ className "new-todo"
      , placeholder "What needs to be done?"
      , value `bindProp` (Rec.prop (SProxy :: SProxy "field") state)
      , onInput (\txt -> send $ NewTodoEdit txt)
      , onKeydown handKeyDown
      ] []
    ]
  where
    handKeyDown code
      | code == "Enter" = send NewTodoCommit
      | code == "Escape" = send NewTodoCancel
      | otherwise = pure unit


viewTodos :: Sender UserInput -> AppState -> Html AppState
viewTodos send state =
  div [ className "main" ]
    [ checkbox [ id "toggle-all", className "toggle-all" ] []
    , label [ for "toggle-all" ] [ text "Mark all as completed" ]
    , ul [ className "todo-list" ]
        `bindList` (todos state) $ (viewSingleTodo send)
    ]

  where
    todos = Rec.prop (SProxy :: SProxy "todos")


viewSingleTodo :: Sender UserInput -> ToDo -> Html ToDo
viewSingleTodo send todo =
  li
    [ className `bindProp` (isCompletedClass todo) ]
    [ div [ className "view" ]
      [ checkbox
        [ className "toggle"
        , checked `bindProp` (isCompleted todo)
        , onCheck \_ -> send $ ToggleCompleted todo.id
        ] []
      , label [] [ text `bindText` txt todo ]
      , button
        [ className "destroy"
        , onClick $ send (RemoveTodo todo.id)
        ] []
      ]
    ]

  where
    txt =
      Rec.prop (SProxy :: SProxy "text")

    isCompleted =
      Rec.prop (SProxy :: SProxy "isCompleted")

    isCompletedClass t =
      IVal.map (Atomic.map (if _ then "completed" else "")) (isCompleted t)


main :: Effect Unit
main = do
  root <- querySelector "#app"
  case root of
    Nothing -> error $ "Cannot find application root element"
    Just n -> do
      { ov: state, sender } <- OVal.create $ IVal.fold' update initialState
      _ <- render n state (view sender initialState)
      pure unit

  where
    initialState =
      { todos: []
      , field: ""
      , lastId: ID 0
      }
