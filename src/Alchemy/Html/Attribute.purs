module Alchemy.Html.Attribute
  where

import Alchemy.Html (Attribute, property)


checked :: ∀ a. Boolean -> Attribute a
checked = property "checked"

className :: ∀ a. String -> Attribute a
className = property "className"

for :: ∀ a. String -> Attribute a
for = property "for"

id :: ∀ a. String -> Attribute a
id = property "id"

inputType :: ∀ a. String -> Attribute a
inputType = property "type"

placeholder :: ∀ a. String -> Attribute a
placeholder = property "placeholder"

value :: ∀ a. String -> Attribute a
value = property "value"
