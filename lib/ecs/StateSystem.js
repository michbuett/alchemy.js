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
        var immutatio = alchemy('Immutatio');
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
             */
            update: function (currentAppState) {
                var stateComponents = this.entities.getAllComponentsOfType('state');

                alchemy.each(stateComponents, this.updateEntity, this, [currentAppState]);
            },

            /** @private */
            updateEntity: function (stateCmp, entityId, appState) {
                if (!stateCmp.current && stateCmp.initial) {
                    stateCmp.current = immutatio.makeImmutable(stateCmp.initial);
                }

                var globalToLocal = stateCmp.globalToLocal;
                if (!globalToLocal) {
                    return;
                }

                var newState = stateCmp.current || immutatio.makeImmutable({});
                if (alchemy.isFunction(globalToLocal)) {
                    stateCmp.current = globalToLocal(appState, newState);
                    return;
                }

                alchemy.each(globalToLocal, function (localKey, globalPath) {
                    newState = newState.set(localKey, immutatio.find(appState, globalPath));
                });

                stateCmp.current = newState;
            }
        };
    });
};
