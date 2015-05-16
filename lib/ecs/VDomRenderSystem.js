module.exports = function (alchemy) {
    'use strict';

    /**
     * An application module to render all view components
     * to the screen
     *
     * @class
     * @name alchemy.ecs.VDomRenderSystem
     * @extends alchemy.core.MateriaPrima
     */
    alchemy.formula.define('alchemy.ecs.VDomRenderSystem', [
        'alchemy.core.MateriaPrima',
        'alchemy.vendor.virtualDom',

    ], function (MateriaPrima ) {

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

        return alchemy.extend(MateriaPrima, {
            /** @lends alchemy.ecs.VDomRenderSystem.prototype */

            /** @override */
            constructor: function (cfg) {
                /**
                 * The entity storage
                 *
                 * @property entities
                 * @type alchemy.ecs.Apothecarius
                 * @private
                 */
                this.entities = null;

                /**
                 * The browser event delegator
                 *
                 * @property delegator
                 * @type alchemy.web.Delegatus
                 * @private
                 */
                this.delegator = null;

                MateriaPrima.constructor.call(this, cfg);
            },

            /** @override */
            dispose: function () {
                this.entities = null;
                this.delegator = null;

                MateriaPrima.dispose.call(this);
            },

            /**
             * Updates the component system (updates dom depending on the current
             * state of the entities)
             */
            update: function () {
                var renderConfigs = this.entities.getAllComponentsOfType('vdom');
                var updates = alchemy.each(renderConfigs, this.updateEntity, this);

                alchemy.each(updates, this.draw, this);
            },

            /** @private */
            updateEntity: function (cfg, entityId, placeholder) {
                if (!this.requiresRender(cfg, entityId)) {
                    return;
                }

                var renderer = this.findRenderer(cfg, entityId);
                var state = this.entities.getComponent(entityId, 'state');
                var children = this.entities.getComponentData(entityId, 'children');
                var context = new RenderContext(entityId, state, cfg.props, children, {});
                var vTree = renderer(context);
                var delegatedEvents = this.entities.getComponent(entityId, 'delegatedEvents');

                if (delegatedEvents) {
                    alchemy.each(delegatedEvents.val(), function (cfg) {
                        this.delegator.delegateKey(cfg.event, cfg.delegate, vTree.properties);
                    }, this);
                }

                cfg = this.entities.setComponent(entityId, 'vdom', {
                    currentTree: vTree,
                    placeholder: context._entityPlaceholder,
                    lastState: state,
                    delegatedEvents: delegatedEvents,
                });

                return cfg;
            },

            /** @private */
            requiresRender: function (renderCfg, entityId) {
                if (!renderCfg.currentTree) {
                    return true;
                }

                var currentState = this.entities.getComponent(entityId, 'state');
                var lastState = renderCfg.lastState;
                if (currentState !== lastState) {
                    return true;
                }

                var currentDelEv = this.entities.getComponent(entityId, 'delegatedEvents');
                var lastDelEv = renderCfg.delegatedEvents;
                if (currentDelEv !== lastDelEv) {
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
                var root = renderCfg.root || document.getElementById(entityId);
                if (!root) {
                    return;
                }

                var patches = diff(renderCfg.lastTree || h(), renderCfg.currentTree);

                renderCfg = this.entities.setComponent(entityId, 'vdom', {
                    root: patch(root, patches),
                    lastTree: renderCfg.currentTree,
                });

                alchemy.each(renderCfg.placeholder, this.drawDependentEntities, this);
            },

            /** @private */
            drawDependentEntities: function (entityId) {
                var renderCfg = this.entities.getComponentData(entityId, 'vdom');
                if (!renderCfg) {
                    return;
                }

                var childRoot = document.getElementById(entityId);
                if (childRoot && childRoot !== renderCfg.root) {
                    this.entities.setComponent(entityId, 'vdom', {
                        root: childRoot,
                        lastTree: h(), // clear cache to force re-draw
                    });
                    this.draw(renderCfg, entityId);
                }
            },
        });
    });
};
