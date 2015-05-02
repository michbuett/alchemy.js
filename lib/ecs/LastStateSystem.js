module.exports = function (alchemy) {
    'use strict';

    /**
     * TODO: document me
     *
     * @class
     * @name alchemy.ecs.LastStateSystem
     */
    alchemy.formula.add({
        name: 'alchemy.ecs.LastStateSystem',

    }, function (_super) {
        return {
            /** @lends alchemy.ecs.LastStateSystem.prototype */

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
             */
            update: function () {
                alchemy.each(this.entities.getAllComponentsOfType('state'), this.updateEntity);
            },

            /** @private */
            updateEntity: function (stateCmp) {
                stateCmp.last = stateCmp.current;
            },
        };
    });
};
