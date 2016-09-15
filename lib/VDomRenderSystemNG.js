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

            this.lastTrees = this.lastTrees || {};
            this.domNodes = this.domNodes || {};
            this.lastAppState = state;

            var todo = this.findRootEntities(entities);
            while (todo.length > 0) {
                var nextId = todo.shift();
                var nextEntity = entities[nextId];

                this.updateEntity(nextEntity, nextId, state);

                if (nextEntity && Array.isArray(nextEntity.children)) {
                    todo = todo.concat(nextEntity.children);
                }
            }
        },

        findRootEntities: function (entities) {
            var result = [];

            each(entities, function (entity, entityId) {
                if (!entity.parent) {
                    result.push(entityId);
                }
            });

            return result;
        },

        /** @private */
        updateEntity: function (entity, entityId, state) {
            var vdom = entity && entity.vdom_ng;
            if (typeof vdom !== 'function') {
                return entity;
            }

            var root = this.domNodes[entityId] || document.getElementById(entityId);
            if (!root) {
                return entity;
            }

            var lastTree = this.lastTrees[entityId] || h();
            var currentTree = vdom(state, entity);

            // enforce entityId
            currentTree.properties.id = entityId;

            this.domNodes[entityId] = this.draw(root, lastTree, currentTree);
            this.lastTrees[entityId] = currentTree;

            return entity;
        },

        /** @private */
        updateChildEntity: function (id, key, appState) {
           var cfg = this.entities.getComponentData(id, 'vdom');
           this.updateEntity(cfg, id, appState);
        },

        /** @private */
        draw: function (root, lastTree, currentTree) {
            var patches = diff(lastTree, currentTree);
            return patch(root, patches);
        },

    });
}());
