module.exports = (function () {
    'use strict';

    var h = require('virtual-dom/h');
    var diff = require('virtual-dom/diff');
    var patch = require('virtual-dom/patch');

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');

    /**
     * An application module to render all view components
     * to the screen
     *
     * @class
     * @name alchemy.ecs.VDomRenderSystem
     */
    return coquoVenenum({
        /** @lends alchemy.ecs.VDomRenderSystem.prototype */

        /**
         * The previous application state
         *
         * @property lastAppState
         * @type Immutablis
         * @private
         */
        lastAppState: undefined,

        /**
         * Updates the component system (updates dom depending on the current
         * state of the entities)
         * @param Immutablis state The current application state
         */
        update: function (entities, state) {
            if (state === this.lastAppState) {
                return;
            }

            this.lastAppState = state;

            return each(entities, this.updateEntity, this, [state]);
        },

        /** @private */
        updateEntity: function (entity, index, state) {
            var vdom = entity.vdom;
            var entityId = entity.id;
            var root = vdom.root || document.getElementById(entityId);

            if (!root) {
                return entity;
            }

            var lastTree = vdom.lastTree || h();
            var currentTree = vdom.renderer(state, entity);

            currentTree.properties.id = entityId;

            vdom.root = this.draw(root, lastTree, currentTree);
            vdom.lastTree = currentTree;

            return entity;
        },

        /** @private */
        draw: function (root, lastTree, currentTree) {
            var patches = diff(lastTree, currentTree);
            return patch(root, patches);
        },

    });
}());
