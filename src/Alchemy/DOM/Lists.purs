module Alchemy.DOM.Lists
  where
--   ( empty
--   , singleton
--   , static
--   , dynamic
--   ) where
--
--
-- import Prelude
--
-- import Alchemy.DOM.Internals.Types (DOM(..), DOMList(..), Node)
-- import Alchemy.Data.Observable (OV, create', sample)
-- import Alchemy.FRP.Subscription (Subscription, together)
-- import Effect.Ref as Ref
-- import Effect.Unsafe (unsafePerformEffect)
--
--
-- -- | An empty list
-- empty :: DOMList
-- empty = DOMList \n -> pure $ pure unit
--
--
-- -- | A list of exactly one childNode
-- singleton :: DOM -> DOMList
-- singleton el = DOMList \n -> renderDOM n el
--
--
-- -- | A static list of DOM elements
-- static :: Array DOM -> DOMList
-- static a =
--   DOMList \n -> together $ (renderDOM n) <$> a
--
--
-- -- | A dynamic list of DOM elements
-- dynamic :: ∀ a. (OV a -> DOM) -> OV (Array a) -> DOMList
-- dynamic renderFn ov =
--   DOMList \n -> do
--
--     initialList <- sample ov
--
--     ovList <- pure $ unsafePerformEffect <$> create' <$> initialList
--
--     cancelFns <- Ref.new ((renderDOM n) <$> renderFn <$> _.ov <$> ovList)
--
--     pure do
--       removeChildren <- Ref.read cancelFns
--       _ <- pure $ unsafePerformEffect <$> removeChildren
--       pure unit
--
--
-- renderDOM :: Node -> DOM -> Subscription
-- renderDOM n (DOM f) = f n
