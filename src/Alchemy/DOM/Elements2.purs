module Alchemy.DOM.Elements2
  ( element
  , div
  , span
  , p
  , text
  , array
  ) where


import Alchemy.DOM (DOM)
import Alchemy.DOM.Attributes (Attr)
import Alchemy.DOM.Events (Handler)
import Alchemy.FRP.ReactiveValue (RV)
import Data.Function.Uncurried (Fn4, runFn4)

foreign import text :: RV String → DOM

foreign import elementImpl ::
  Fn4 String (Array Attr) (Array Handler) (Array DOM) DOM


element ::
  String → Array Attr → Array Handler → Array DOM → DOM
element = runFn4 elementImpl


div :: Array Attr → Array Handler → Array DOM → DOM
div = element "div"


span :: Array Attr → Array Handler → DOM → DOM
span a h t = element "span" a h [t]


p :: Array Attr → Array Handler → Array DOM → DOM
p = element "p"


foreign import arrayImpl ::
  ∀ a. Fn4 String (Array Attr) (RV a → DOM) (RV (Array a)) DOM


array ::
  ∀ a. String → Array Attr → (RV a → DOM) → RV (Array a) → DOM
array = runFn4 arrayImpl
