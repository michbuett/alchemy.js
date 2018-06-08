module Alchemy.DOM.Elements
  ( element
  , div
  , span
  , p
  , text
  , textS
  , array
  ) where


import Alchemy.DOM (DOM)
import Alchemy.DOM.Attributes (Attr)
import Alchemy.DOM.Events (Handler)
import Alchemy.FRP.TimeFunction (TF)
import Data.Function.Uncurried (Fn4, runFn4)

foreign import textS :: TF String → DOM

foreign import text :: String → DOM

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
  ∀ a. Fn4 String (Array Attr) (TF a → DOM) (TF (Array a)) DOM


array ::
  ∀ a. String → Array Attr → (TF a → DOM) → TF (Array a) → DOM
array = runFn4 arrayImpl
