module.exports = function (alchemy) {
    'use strict';

    /**
     * TODO: document me
     *
     * @class
     * @name alchemy.ecs.StaticChildrenSystem
     */
    alchemy.formula.add({
        name: 'alchemy.ecs.StaticChildrenSystem',

    }, function (_super) {
        return {
            /** @lends alchemy.ecs.StaticChildrenSystem.prototype */

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
                var staticTreeCmps = this.entities.getAllComponentsOfType('staticChildren');
                var processedEntities = [];

                alchemy.each(staticTreeCmps, function (cmp) {
                    this.createAllChildrenForEntity(cmp);
                    processedEntities.push(cmp.id);
                }, this);

                alchemy.each(processedEntities, function (entityId) {
                    this.entities.removeComponent(entityId, 'staticChildren');
                }, this);
            },

            /** @private */
            createAllChildrenForEntity: function (cmp) {
                var entityId = cmp.id;
                var children = this.entities.getComponent(entityId, 'children');
                var data = alchemy.each(cmp, this.createChild, this);

                if (!children) {
                    children = this.entities.addComponent(entityId, 'children', {
                        current: alchemy('Immutatio').makeImmutable(data),
                        last: null,
                        id: entityId,
                    });

                } else {
                    children.last = children.current;
                }

                children.current = children.current.set(data);
            },

            /** @private */
            createChild: function (cfg, key) {
                if (key === 'id') {
                    return;
                }

                return this.entities.createEntity(cfg);
            },
        };
    });
};
