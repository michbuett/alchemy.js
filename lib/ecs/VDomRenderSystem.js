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
        var placeholderKey = 'placeholder_for_entity';

        /**
         * @class
         * @name RenderContext
         */
        function RenderContext(id, state, children, placeholder) {
            this.entityId = id;
            this.state = state;
            this.children = children;

            /**
             * The hyperscript function to create virtual dom nodes
             */
            this.h = function hWrap(tag, props, children) {
                var vdom = h(tag, props, children);
                alchemy.each(children, function (child, index) {
                    var entityId = alchemy.meta(child, placeholderKey);
                    if (entityId) {
                        placeholder[entityId] = {
                            index: index,
                            array: vdom.children,
                        };
                    }
                }, this);

                return vdom;
            };
        }

        /**
         * Renders a child entity at the current location (it actually creates a
         * placeholder for that very entity)
         *
         * @param {String} entityId The id of the child entity to be rendered
         * @return VDom a virtual dom node representing the child entity
         */
        RenderContext.prototype.renderChild = function renderChild(entityId) {
            var placeholderNode = h('div.entity-placeholder', null, 'Unknown Entity: ' + entityId);
            alchemy.meta(placeholderNode, placeholderKey, entityId);
            return placeholderNode;
        };

        /**
         * Renderes all available child entites
         *
         * @return array An array of virtual dom nodes
         */
        RenderContext.prototype.renderAllChildren = function renderAllChildren() {
            return alchemy.each(this.children, this.renderChild, this) || [];
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

            update: function () {
                var renderConfigs = this.entities.getAllComponentsOfType('vdom');
                var placeholder = {};
                var rootNodes = [];

                renderConfigs.each(this.updateEntity, this, [placeholder, rootNodes]);
                alchemy.each(placeholder, this.linkChildren, this);
                alchemy.each(rootNodes, this.drawEntity, this);
            },

            /** @private */
            updateEntity: function (renderCfg, index, placeholder, rootNodes) {
                if (!this.requiresRender(renderCfg)) {
                    return;
                }

                var renderer = alchemy(renderCfg.renderer);
                var state = this.entities.getComponent(renderCfg.id, 'state');
                var children = this.entities.getComponent(renderCfg.id, 'children');
                var context = new RenderContext(
                    renderCfg.id,
                    state && state.current,
                    children && children.current && children.current.val(),
                    placeholder
                );

                renderCfg.last = renderCfg.current;
                renderCfg.current = renderer.render(context);

                if (renderCfg.root) {
                    rootNodes.push(renderCfg);
                }
            },

            /** @private */
            requiresRender: function (renderCfg) {
                if (!renderCfg.current) {
                    return true;
                }

                var state = this.entities.getComponent(renderCfg.id, 'state');
                if (state && state.current !== state.last) {
                    return true;
                }

                var children = this.entities.getComponent(renderCfg.id, 'children');
                if (children && children.current !== children.last) {
                    return true;
                }

                return false;
            },

            /** @private */
            linkChildren: function (cfg, entityId) {
                var vdom = this.entities.getComponent(entityId, 'vdom');
                if (!vdom) {
                    return;
                }

                cfg.array[cfg.index] = vdom.current;
            },

            /** @private */
            drawEntity: function (renderCfg) {
                var oldTree = renderCfg.last || renderCfg.root;
                var newTree = renderCfg.current;
                var patches = diff(oldTree, newTree);

                renderCfg.root = patch(renderCfg.root, patches);
            },
        };
    });
};
