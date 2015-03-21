module.exports = function (alchemy) {
    'use strict';

    /**
     * TODO: document me
     *
     * @class
     * @name alchemy.ecs.HierarchySystem
     */
    alchemy.formula.add({
        name: 'alchemy.ecs.HierarchySystem',

    }, function (_super) {
        return {
            /** @lends alchemy.ecs.HierarchySystem.prototype */

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
