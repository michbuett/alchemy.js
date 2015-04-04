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
            this.entityId = id;
            this.state = state;
            this.props = props;
            this.children = children;
        }

        /**
         * The hyperscript function to create virtual dom nodes
         */
        RenderContext.prototype.h = h;

        /**
         * Renders a child entity at the current location (it actually creates a
         * placeholder for that very entity)
         *
         * @param {String} entityId The id of the child entity to be rendered
         * @return VDom a virtual dom node representing the child entity
         */
        RenderContext.prototype.renderChild = function renderChild(entityId) {
            return h('div#placeholder_' + entityId);
        };

        /**
         * Renderes all available child entites
         *
         * @return array An array of virtual dom nodes
         */
        RenderContext.prototype.renderAllChildren = function renderAllChildren() {
            return alchemy.each(alchemy.values(this.children), this.renderChild, this) || [];
        };

        return {
            /** @lends alchemy.ecs.VDomRenderSystem.prototype */

            /**
             * The entity storage
             *
             * @property entities
             * @type alchemy.ecs.Apothecarius
             * @private
             */
            entities: undefined,

            constructor: function (cfg) {
                this.entities = null;
                this.rootNodes = {};

                _super.constructor.call(this, cfg);
            },

            update: function () {
                var renderConfigs = this.entities.getAllComponentsOfType('vdom');
                var updates = alchemy.each(renderConfigs, this.updateEntity, this);

                alchemy.each(updates, this.draw, this);
            },

            /** @private */
            updateEntity: function (renderCfg, index, placeholder) {
                if (!this.requiresRender(renderCfg)) {
                    return;
                }

                this.requiresDraw = true;

                var entityId = renderCfg.id;
                var renderer = alchemy(renderCfg.renderer);
                var state = this.entities.getComponent(entityId, 'state');
                var children = this.entities.getComponent(entityId, 'children');
                var context = new RenderContext(
                    entityId,
                    state && state.current,
                    renderCfg.props,
                    children && children.current && children.current.val(),
                    {}
                );
                var vdom = renderer.render(context);

                var delegatedEvents = this.entities.getComponent(entityId, 'delegatedEvents');
                if (delegatedEvents && delegatedEvents.current) {
                    alchemy.each(delegatedEvents.current.val(), function (cfg) {
                        this.delegator.delegateKey(cfg.event, cfg.delegate, vdom.properties);
                    }, this);
                }

                renderCfg.last = renderCfg.current || h();
                renderCfg.current = vdom;
                renderCfg.patches = diff(renderCfg.last, renderCfg.current);

                return renderCfg;
            },

            /** @private */
            requiresRender: function (renderCfg) {
                if (!renderCfg.current) {
                    return true;
                }

                var entityId = renderCfg.id;
                var state = this.entities.getComponent(entityId, 'state');
                if (state && state.current !== state.last) {
                    return true;
                }

                var children = this.entities.getComponent(entityId, 'children');
                if (children && children.current !== children.last) {
                    return true;
                }

                var delegatedEvents = this.entities.getComponent(entityId, 'delegatedEvents');
                if (delegatedEvents && delegatedEvents.current !== delegatedEvents.last) {
                    return true;
                }

                return false;
            },

            /** @private */
            draw: function (renderCfg) {
                var entityId = renderCfg.id;
                var root = renderCfg.root || document.getElementById('placeholder_' + entityId);

                if (!root) {
                    // cannot render entity to dom because no root node was found
                    // -> force re-render in next update cycle
                    renderCfg.current = null;
                    return;
                }

                // console.log('[DEBUG] patch DOM node for "' + entityId + '"', renderCfg.patches);
                renderCfg.root = patch(root, renderCfg.patches);
            },
        };
    });
};
