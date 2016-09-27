module.exports = (function () {
    'use strict';

    var h = require('virtual-dom/h');
    var diff = require('virtual-dom/diff');
    var patch = require('virtual-dom/patch');

    var coquoVenenum = require('coquo-venenum');

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
         * Updates the DOM according to the entities virtual-dom tree
         *
         * @param Map entities The current UI entities
         */
        update: function (entities) {

            /**
             * The cached previous virtual dom trees
             *
             * @property lastTrees
             * @type Object
             * @memberOf alchemy.ecs.VDomRenderSystemNG
             * @private
             */
            this.lastTrees = this.lastTrees || {};

            /**
             * The cached dom root nodes of the entites
             *
             * @property domNodes
             * @type Object
             * @memberOf alchemy.ecs.VDomRenderSystemNG
             * @private
             */
            this.domNodes = this.domNodes || {};

            entities.forEach(this.updateEntity, this);
        },

        /** @private */
        updateEntity: function (entity, entityId) {
            var currentTree = entity && entity.vdom;
            if (!currentTree || typeof currentTree !== 'object') {
                return;
            }

            var root = this.domNodes[entityId] || document.getElementById(entityId);
            if (!root) {
                return;
            }

            var lastTree = this.lastTrees[entityId] || h();

            // enforce entityId
            currentTree.properties.id = entityId;

            this.domNodes[entityId] = this.draw(root, lastTree, currentTree);
            this.lastTrees[entityId] = currentTree;
            this.checkChildEntityCache(entity.children);

            return entity;
        },

        /** @private */
        checkChildEntityCache: function (childEntities) {
            if (!childEntities) {
                return;
            }

            for (var i = 0, l = childEntities.length; i < l; i++) {
                var childEntityId = childEntities[i].id;
                var currChildNode = document.getElementById(childEntityId);

                if (this.domNodes[childEntityId] !== currChildNode) {
                    this.domNodes[childEntityId] = currChildNode;
                    this.lastTrees[childEntityId] = h(); // reset previous tree to enforce redraw
                }
            }
        },

        /** @private */
        draw: function (root, lastTree, currentTree) {
            var patches = diff(lastTree, currentTree);
            return patch(root, patches);
        },
    });
}());
