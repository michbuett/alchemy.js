module.exports = function (alchemy) {
    'use strict';

    /**
     * TODO: document me
     *
     * @class
     * @name alchemy.ecs.StaticTreeSystem
     */
    alchemy.formula.add({
        name: 'alchemy.ecs.StaticTreeSystem',

    }, function (_super) {
        return {
            /** @lends alchemy.ecs.StaticTreeSystem.prototype */

            /**
             * The entity storage
             *
             * @property entities
             * @type alchemy.ecs.Apothecarius
             * @private
             */
            entities: undefined,

            /**
             * Updates the component system with the current application state
             *
             * @param Immutable appState The current application state
             */
            update: function () {
                var staticTreeCmps = this.entities.getAllComponentsOfType('staticTree');
                var processedEntities = [];

                alchemy.each(staticTreeCmps, function (cmp) {
                    this.createAllChildrenForEntity(cmp);
                    processedEntities.push(cmp.id);
                }, this);

                alchemy.each(processedEntities, function (entityId) {
                    this.entities.removeComponent(entityId, 'staticTree');
                }, this);
            },

            /** @private */
            createAllChildrenForEntity: function (cmp) {
                var entityId = cmp.id;
                var children = this.entities.getComponent(entityId, 'children');
                var data = alchemy.each(cmp.children, this.createChild, this);

                if (!children) {
                    children = {
                        current: alchemy('Immutatio').makeImmutable(data),
                        last: null,
                        id: entityId,
                    };

                    this.entities.addComponent(entityId, 'children', children);
                } else {
                    children.last = children.current;
                }

                children.current = children.current.set(data);
            },

            /** @private */
            createChild: function (cfg) {
                return this.entities.createEntity(cfg);
            },
        };
    });
};
