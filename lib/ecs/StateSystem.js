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

            /** @override */
            constructor: function (cfg) {
                /**
                 * The entity storage
                 *
                 * @property entities
                 * @type alchemy.ecs.Apothecarius
                 * @private
                 */
                this.entities = undefined;

                /**
                 * The previous application state (there is no need to update all
                 * entities if the global application state remained unchanged)
                 *
                 * @property lastState
                 * @type Object
                 * @private
                 */
                this.lastStates = undefined;

                MateriaPrima.constructor.call(this, cfg);
            },

            /** @override */
            dispose: function () {
                this.entities = null;
                this.lastState = null;

                MateriaPrima.dispose.call(this);
            },

            /**
             * Updates the component system with the current application state
             *
             * @param Immutable currentAppState The current application state
             */
            update: function (currentAppState) {
                if (currentAppState === this.lastState) {
                    return;
                }

                var stateComponents = this.entities.getAllComponentsOfType('globalToLocal');

                alchemy.each(stateComponents, this.updateEntity, this, [currentAppState]);

                this.lastState = currentAppState;
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
