module Alchemy.DOM.Elements
  ( a
  , button
  , checkbox
  , div
  , element
  , h1
  , h2
  , h3
  , h4
  , h5
  , inputText
  , label
  , li
  , list
  , ol
  , p
  , span
  , text
  , text'
  , ul
  ) where


import Prelude

import Alchemy.DOM.Attributes.Static (attr)
import Alchemy.DOM.Internals.Types (Attr(..), DOM(..), Node)
import Alchemy.DOM.Internals.Unsafe (appendChild, createElement, createTextNode, removeChild, unsafeSetObjectProperty)
import Alchemy.Data.Observable (OV, constant, create', sample, values)
import Alchemy.Debug (debugLog)
import Alchemy.FRP.Event (subscribe)
import Alchemy.FRP.Subscription (Subscription, together)
import Data.Array (snoc)
import Effect.Ref as Ref
import Effect.Unsafe (unsafePerformEffect)

a :: Array Attr → Array DOM → DOM
a = element "a"


div :: Array Attr → Array DOM → DOM
div = element "div"


ul :: Array Attr → Array DOM → DOM
ul = element "ul"


ol :: Array Attr → Array DOM → DOM
ol = element "ol"


inputText :: Array Attr → Array DOM -> DOM
inputText al = element "input" (snoc al inputType)
  where
    inputType = attr "type" "text"

checkbox :: Array Attr → Array DOM -> DOM
checkbox al = element "input" (snoc al inputType)
  where
    inputType = attr "type" "checkbox"


button :: Array Attr → Array DOM -> DOM
button = element "button"


span :: Array Attr → Array DOM → DOM
span = element "span"


h1 :: Array Attr → Array DOM → DOM
h1 = element "h1"


h2 :: Array Attr → Array DOM → DOM
h2 = element "h2"


h3 :: Array Attr → Array DOM → DOM
h3 = element "h3"


h4 :: Array Attr → Array DOM → DOM
h4 = element "h4"


h5 :: Array Attr → Array DOM → DOM
h5 = element "h5"


p :: Array Attr → Array DOM → DOM
p = element "p"


li :: Array Attr → Array DOM → DOM
li = element "li"


label :: Array Attr → Array DOM → DOM
label = element "label"

-- | Just a plain text node which is updated if the value changes
text :: OV String -> DOM
text ovTxt =
  DOM \n -> do
    txt <- sample ovTxt
    textNode <- createTextNode txt
    unsub <- subscribe (values ovTxt) (unsafeSetObjectProperty "textContent" n)
    appendChild n textNode
    pure (cancel n textNode unsub)
  where
    cancel parent child unsubscribe = do
      _ <- unsubscribe
      removeChild parent child


-- | A simplified version of ´text´ which can be used to create static text
text' :: String -> DOM
text' s = text (constant s)


-- | General way to create HTML nodes. It is used to define all of the helper
-- | functions in this library.
element :: String -> Array Attr -> Array DOM -> DOM
element tagname attributes children =
  DOM \parent -> do
    el <- createElement tagname
    cancelSubscribers <- subscribers el
    appendChild parent el
    pure (cancel parent el cancelSubscribers)

  where
    subscribers n =
      together $
        ((renderAttribute n) <$> attributes) <> ((renderDOM n) <$> children)

    cancel pn cn cancelSubscribers = do
      _ <- cancelSubscribers
      removeChild pn cn


-- | A dynamic list of DOM elements
list :: ∀ a. (OV a -> DOM) -> OV (Array a) -> DOM
list renderFn ov =
  DOM \n -> do
    initialList <- sample ov
    ovList <- pure $ unsafePerformEffect <$> create' <$> initialList
    cancelFns <- Ref.new ( ovList
                            <#> _.ov
                            <#> renderFn
                            <#> (renderDOM n)
                            <#> unsafePerformEffect )
    debugLog cancelFns

    pure do
      removeChildren <- Ref.read cancelFns
      _ <- pure $ unsafePerformEffect <$> removeChildren
      pure unit


renderDOM :: Node -> DOM -> Subscription
renderDOM n (DOM f) = f n


renderAttribute :: Node -> Attr -> Subscription
renderAttribute n (Attr f) = f n
