module Alchemy.Html.Element
  where


import Prelude
import Alchemy.Html (Attribute, Html, element)
import Alchemy.Html.Attribute (inputType)


div :: ∀ a. Array (Attribute a) -> Array (Html a) -> Html a
div = element "div"


label :: ∀ a. Array (Attribute a) -> Array (Html a) -> Html a
label = element "label"


h1 :: ∀ a. Array (Attribute a) -> Array (Html a) -> Html a
h1 = element "h1"


inputText :: ∀ a. Array (Attribute a) -> Array (Html a) -> Html a
inputText as = element "input" (as <> [ inputType "text" ])


button :: ∀ a. Array (Attribute a) -> Array (Html a) -> Html a
button = element "button"


checkbox :: ∀ a. Array (Attribute a) -> Array (Html a) -> Html a
checkbox as = element "input" (as <> [ inputType "checkbox" ])


ul :: ∀ a. Array (Attribute a) -> Array (Html a) -> Html a
ul = element "ul"


li :: ∀ a. Array (Attribute a) -> Array (Html a) -> Html a
li = element "li"
