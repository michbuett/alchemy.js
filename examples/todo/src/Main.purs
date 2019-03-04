module Example.Todo.Main where

import Prelude

import Effect (Effect)
import Type.Prelude (SProxy(..))

import Alchemy.IDOM
import Alchemy.Data.Increment.Value as IVal
import Alchemy.Data.Incremental.Atomic as Atomic
import Alchemy.Data.Incremental.Record as Rec
import Alchemy.Data.Observable as OVal

data UserInput
  = AddTodo String

type ToDo =
  { text :: String
  , isCompleted :: Boolean
  }

type AppState =
  { todos :: Array ToDo
  }

update :: UserInput -> AppState -> AppState
update ui state = state

view :: AppState -> Dom AppState
view state =
  div_ [ className_ "todoapp" ]
    [ viewHeader
    , viewTodos state
    ]


viewHeader :: ∀ a. Dom a
viewHeader =
  div_
    [ className_ "header" ]
    [ h1_ [] [ text_ "todos" ]
    , inputText_
      [ className_ "new-todo"
      , placeholder_ "What needs to be done?"
      ] []
    ]


viewTodos :: AppState -> Dom AppState
viewTodos state =
  div_ [ className_ "main" ]
    [ checkbox_ [ id_ "toggle-all", className_ "toggle-all" ] []
    , label_ [ for_ "toggle-all" ] [ text_ "Mark all as completed" ]
    , ul [ className_ "todo-list" ]
        $ list (todos state) viewSingleTodo
    ]

  where
    todos = Rec.prop (SProxy :: SProxy "todos")


viewSingleTodo :: ToDo -> Dom ToDo
viewSingleTodo todo =
  li_
    [ className $ isCompletedClass todo ]
    [ div_ [ className_ "view" ]
      [ checkbox_ [ className_ "toggle" , checked $ isCompleted todo ] []
      , label_ [] [ text $ txt todo ]
      , button_ [ className_ "destroy" ] []
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
  pure unit
  { ov: state } <- OVal.create $ IVal.lift initialState
  _ <- render "#app" state (view initialState)
  pure unit


  where
    initialState =
      { todos:
        [ { text: "Text of the first TODO"
          , isCompleted: true
          }
        , { text: "Text of a second TODO"
          , isCompleted: false
          }
        , { text: "And finally the 3rd TODO"
          , isCompleted: true
          }
        ]
      }
