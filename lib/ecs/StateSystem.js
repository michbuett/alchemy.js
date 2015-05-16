module.exports = function (alchemy) {
    'use strict';

    /**
     * TODO: document me
     *
     * @class
     * @name alchemy.ecs.StateSystem
     * @extends alchemy.core.MateriaPrima
     */
    alchemy.formula.define('alchemy.ecs.StateSystem', [
        'alchemy.core.MateriaPrima',
        'alchemy.core.Immutatio'

    ], function (MateriaPrima, Immutatio) {

        return alchemy.extend(MateriaPrima, {
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
                var stateComponents = this.entities.getAllComponentsOfType('globalToLocal');

                alchemy.each(stateComponents, this.updateEntity, this, [currentAppState]);
            },

            /** @private */
            updateEntity: function (globalToLocal, entityId, appState) {
                var newState = this.entities.getComponentData(entityId, 'state') || {};

                if (alchemy.isFunction(globalToLocal)) {
                    newState = globalToLocal(appState, newState);

                } else {
                    alchemy.each(globalToLocal, function (localKey, globalPath) {
                        newState[localKey] = Immutatio.find(appState, globalPath);
                    });
                }

                this.entities.setComponent(entityId, 'state', newState);
            }
        });
    });
};
