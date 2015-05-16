module.exports = function (alchemy) {
    'use strict';

    /**
     * An application module to render all view components
     * to the screen
     *
     * @class
     * @name alchemy.ecs.VDomRenderSystem
     */
    alchemy.formula.add({
        name: 'alchemy.ecs.VDomRenderSystem',
        requires: [
            'alchemy.vendor.virtualDom',
        ],

    }, function (_super) {
        var virtualDom = alchemy('virtualDom');
        var h = virtualDom.h;
        var diff = virtualDom.diff;
        var patch = virtualDom.patch;

        /**
         * @class
         * @name RenderContext
         */
        function RenderContext(id, state, props, children) {
            this._entityPlaceholder = null;

            /**
             * @property
             * @name entityId
             * @type String
             * @memberOf RenderContext
             */
            this.entityId = id;

            /**
             * @property
             * @name state
             * @type Immutable
             * @memberOf RenderContext
             */
            this.state = state;

            /**
             * @property
             * @name props
             * @type Object
             * @memberOf RenderContext
             */
            this.props = props;

            /**
             * @property
             * @name children
             * @type Array/Object
             * @memberOf RenderContext
             */
            this.children = children;
        }

        /**
         * The hyperscript function to create virtual dom nodes
         * @function
         */
        RenderContext.prototype.h = h;

        /**
         * Renders a child entity at the current location (it actually creates a
         * placeholder for that very entity)
         *
         * @param {String} entityId The id of the child entity to be rendered
         * @return VDom a virtual dom node representing the child entity
         */
        RenderContext.prototype.placeholder = function placeholder(entityId) {
            this._entityPlaceholder = this._entityPlaceholder || [];
            this._entityPlaceholder.push(entityId);

            return h('div', {id: entityId, key: entityId});
        };


        /**
         * Renders a placeholder for a child entity defined by the given key
         *
         * @param {String} key The key of the child entity to be rendered
         * @return VDom a virtual dom node representing the child entity
         */
        RenderContext.prototype.renderChild = function renderChild(key) {
            return this.placeholder(this.children[key]);
        };

        /**
         * Renderes all available child entites
         *
         * @return array An array of virtual dom nodes
         */
        RenderContext.prototype.renderAllChildren = function renderAllChildren() {
            return alchemy.each(alchemy.values(this.children), this.placeholder, this) || [];
        };

        return {
            /** @lends alchemy.ecs.VDomRenderSystem.prototype */

            constructor: function (cfg) {
                /**
                 * The entity storage
                 *
                 * @property entities
                 * @type alchemy.ecs.Apothecarius
                 * @private
                 */
                this.entities = null;

                _super.constructor.call(this, cfg);
            },

            update: function () {
                var renderConfigs = this.entities.getAllComponentsOfType('vdom');
                var updates = alchemy.each(renderConfigs, this.updateEntity, this);

                alchemy.each(updates, this.draw, this);
            },

            /** @private */
            updateEntity: function (renderCfg, entityId, placeholder) {
                if (!this.requiresRender(renderCfg, entityId)) {
                    return;
                }

                var renderer = this.findRenderer(renderCfg, entityId);
                var state = this.entities.getComponent(entityId, 'state');
                var children = this.entities.getComponent(entityId, 'children');
                var context = new RenderContext(
                    entityId,
                    state && state.current,
                    renderCfg.props,
                    children,
                    {}
                );
                var vdom = renderer(context);

                var delegatedEvents = this.entities.getComponent(entityId, 'delegatedEvents');
                if (delegatedEvents && delegatedEvents.current) {
                    alchemy.each(delegatedEvents.current.val(), function (cfg) {
                        this.delegator.delegateKey(cfg.event, cfg.delegate, vdom.properties);
                    }, this);
                }

                // renderCfg.last = renderCfg.current || h();
                renderCfg.current = vdom;
                renderCfg.placeholder = context._entityPlaceholder;

                return renderCfg;
            },

            /** @private */
            requiresRender: function (renderCfg, entityId) {
                if (!renderCfg.current) {
                    return true;
                }

                var state = this.entities.getComponent(entityId, 'state');
                if (state && state.current !== state.last) {
                    return true;
                }

                var delegatedEvents = this.entities.getComponent(entityId, 'delegatedEvents');
                if (delegatedEvents && delegatedEvents.current !== delegatedEvents.last) {
                    return true;
                }

                return false;
            },

            /** @private */
            findRenderer: function (cfg, entityId) {
                if (typeof cfg.renderer === 'function') {
                    return cfg.renderer;
                }

                if (typeof cfg.renderer === 'string') {
                    return alchemy(cfg.renderer).render;
                }

                throw 'Cannot determine renderer for entity "' + entityId + '"!';
            },

            /** @private */
            draw: function (renderCfg, entityId) {
                if (renderCfg.last === renderCfg.current) {
                    return;
                }

                var root = renderCfg.root || document.getElementById(entityId);
                if (!root) {
                    return;
                }

                var patches = diff(renderCfg.last || h(), renderCfg.current);

                renderCfg.root = patch(root, patches);
                renderCfg.last = renderCfg.current;

                alchemy.each(renderCfg.placeholder, this.drawDependentEntities, this);
            },

            /** @private */
            drawDependentEntities: function (entityId) {
                var renderCfg = this.entities.getComponent(entityId, 'vdom');
                if (!renderCfg) {
                    return;
                }

                var childRoot = document.getElementById(entityId);
                if (childRoot && childRoot !== renderCfg.root) {
                    renderCfg.last = h(); // clear cache to force re-draw
                    renderCfg.root = childRoot;
                    this.draw(renderCfg);
                }
            },
        };
    });
};
