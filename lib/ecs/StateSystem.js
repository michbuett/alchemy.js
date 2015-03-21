module.exports = function (alchemy) {
    'use strict';

    /**
     * TODO: document me
     *
     * @class
     * @name alchemy.ecs.StateSystem
     */
    alchemy.formula.add({
        name: 'alchemy.ecs.StateSystem',

    }, function (_super) {
        return {
            /** @lends alchemy.ecs.StateSystem.prototype */

            /**
             * The entity storage
             *
             * @property entites
             * @type alchemy.ecs.Apothecarius
             * @private
             */
            entites: undefined,

            /**
             * Updates the component system with the current application state
             *
             * @param Immutable appState The current application state
             */
            update: function () {
            },
        };
    });
};
