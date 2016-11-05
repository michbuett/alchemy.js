module.exports = (function () {
    'use strict';

    var h = require('virtual-dom/h');
    var diff = require('virtual-dom/diff');
    var patch = require('virtual-dom/patch');

    var formula = require('./Formula');

    /**
     * An application module to render all view components
     * to the screen
     *
     * @class
     * @name alchemy.lib.VDomRenderSystem
     */
    return formula({
        /** @lends alchemy.lib.VDomRenderSystem.prototype */

        /**
         * Updates the DOM according to the entities virtual-dom tree
         *
         * @param Array entities The current UI entities
         */
        update: function (entities) {

            /**
             * The cached previous virtual dom trees
             *
             * @property lastTrees
             * @type Object
             * @memberOf alchemy.lib.VDomRenderSystemNG
             * @private
             */
            this.lastTrees = this.lastTrees || {};

            /**
             * The cached dom root nodes of the entites
             *
             * @property domNodes
             * @type Object
             * @memberOf alchemy.lib.VDomRenderSystemNG
             * @private
             */
            this.domNodes = this.domNodes || {};

            for (var i = 0, l = entities.length; i < l; i++) {
                this.updateEntity(entities[i]);
            }
        },

        /** @private */
        updateEntity: function (entity) {
            var currentTree = entity && entity.vdom;
            if (!currentTree || typeof currentTree !== 'object') {
                return;
            }

            var entityId = entity.id;
            var root = this.domNodes[entityId] || document.getElementById(entityId);
            if (!root) {
                return;
            }

            // enforce entityId
            currentTree.properties.id = entityId;

            var lastTree = this.lastTrees[entityId] || h();
            var patches = diff(lastTree, currentTree);

            this.domNodes[entityId] = patch(root, patches);
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
                    this.lastTrees[childEntityId] = dom2hs(currChildNode);
                }
            }
        },
    });

    /** @private */
    function dom2hs(dom) {
        var children = [];

        for (var i = 0, l = dom.childNodes.length; i < l; i++) {
            var cn = dom.childNodes[i];

            if (cn instanceof HTMLElement) {
                children.push(dom2hs(cn));
            } else if (cn instanceof Text) {
                children.push(cn.nodeValue);
            }
        }

        var attributes = {};

        if (dom.id) {
            attributes.id = dom.id;
        }
        if (dom.className) {
            attributes.className = dom.className;
        }
        if (dom.type) {
            attributes.type = dom.type;
        }

        return h(dom.tagName, attributes, children);
    }
}());
