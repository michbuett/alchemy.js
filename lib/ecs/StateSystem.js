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
        requires: [
            'alchemy.core.Immutatio'
        ],

    }, function (_super) {
        return {
            /** @lends alchemy.ecs.StateSystem.prototype */

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
             * @param Immutable currentAppState The current application state
             * @param Immutable lastAppState The last application state
             */
            update: function (currentAppState, lastAppState) {
                if (currentAppState === lastAppState) {
                    return;
                }

                var stateComponents = this.entities.getAllComponentsOfType('state');
                stateComponents.each(this.updateEntity, this, [currentAppState]);
            },

            /** @private */
            updateEntity: function (stateCmp, index, appState) {
                var globalToLocal = stateCmp.globalToLocal;
                if (!globalToLocal) {
                    return;
                }

                var immutatio = alchemy('Immutatio');
                var newState = stateCmp.current || immutatio.makeImmutable({});

                alchemy.each(globalToLocal, function (localKey, globalPath) {
                    newState = newState.set(localKey, immutatio.find(appState, globalPath));
                });

                stateCmp.last = stateCmp.current;
                stateCmp.current = newState;
            }
        };
    });
};
