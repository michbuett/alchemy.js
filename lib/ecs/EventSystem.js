module.exports = function (alchemy) {
    'use strict';

    /**
     * A component system to register/delegate event handler to dom events
     *
     * @class
     * @name alchemy.ecs.EventSystem
     */
    alchemy.formula.add({
        name: 'alchemy.ecs.EventSystem',

    }, function (_super) {
        return {
            /** @lends alchemy.ecs.EventSystem.prototype */

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
