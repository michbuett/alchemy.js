module Example.Todo.Main where

import Prelude

import Alchemy.DOM (render)
import Alchemy.DOM.Attributes.Dynamic as AttrD
import Alchemy.DOM.Attributes.Static as AttrS
import Alchemy.DOM.Elements as El
import Alchemy.DOM.Internals.Types (DOM)
import Alchemy.Data.Observable (OV, create', get)
import Effect (Effect)
import Type.Prelude (SProxy(..))

type ToDo =
  { text :: String
  , isCompleted :: Boolean
  }

type AppState =
  { todos :: Array ToDo
  }


view :: OV AppState -> DOM
view state =
  El.div
    [ AttrS.className "todoapp" ]
    [ viewHeader
    , viewTodos $ get (SProxy :: SProxy "todos") state
    ]

viewHeader :: DOM
viewHeader =
  El.div
    [ AttrS.className "header" ]
    [ El.h1 [] [ El.text' "todos" ]
    , El.inputText
      [ AttrS.className "new-todo"
      , AttrS.placeholder "What needs to be done?"
      ] []
    ]

viewTodos :: OV (Array ToDo) -> DOM
viewTodos todos =
  El.div [ AttrS.className "main" ]
    [ El.checkbox
      [ AttrS.className "toggle-all"
      , AttrS.id "toggle-all"
      ] []
    , El.label
      [ AttrS.for "toggle-all" ]
      [ El.text' "Mark all as complete" ]
    , El.ul
      [ AttrS.className "todo-list" ]
      [ El.list viewSingleTodo todos ]
    ]

viewSingleTodo :: OV ToDo -> DOM
viewSingleTodo todo =
  El.li [ AttrD.checked (get (SProxy :: SProxy "isCompleted") todo) ]
    [ El.div [ AttrS.className "view" ]
      [ El.checkbox
        [ AttrS.className "toggle"
        , AttrD.checked (isCompleted todo)
        ] []
      , El.label [] [ El.text (text todo) ]
      , El.button [ AttrS.className "destroy" ] []
      ]
    ]

  where
    isCompleted = get (SProxy :: SProxy "isCompleted")
    text = get (SProxy :: SProxy "text")

main :: Effect Unit
main = do
  { ov: state } <- create' initialState
  _ <- render "#app" (view state)
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
        ]
      }
