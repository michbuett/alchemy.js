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
                // if (currentAppState === this.lastAppState) {
                //     return;
                // }

                var stateComponents = this.entities.getAllComponentsOfType('state');

                alchemy.each(stateComponents, this.updateEntity, this, [currentAppState]);

                this.lastAppState = currentAppState;
            },

            /** @private */
            updateEntity: function (stateCmp, index, appState) {
                stateCmp.last = stateCmp.current;

                if (!stateCmp.current && stateCmp.initial) {
                    stateCmp.current = immutatio.makeImmutable(stateCmp.initial);
                }

                var globalToLocal = stateCmp.globalToLocal;
                if (globalToLocal) {
                    var newState = stateCmp.current || immutatio.makeImmutable({});

                    alchemy.each(globalToLocal, function (localKey, globalPath) {
                        newState = newState.set(localKey, immutatio.find(appState, globalPath));
                    });

                    stateCmp.current = newState;
                }
            }
        };
    });
};
