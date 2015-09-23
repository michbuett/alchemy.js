module.exports = (function () {
    'use strict';

    var immutable = require('immutabilis');
    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');
    var utils = require('./Alchemy');

    /**
     * TODO: document me
     *
     * @class
     * @name alchemy.ecs.StateSystem
     * @extends alchemy.core.MateriaPrima
     */
    return coquoVenenum({
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
         * The previous application state (there is no need to update all
         * entities if the global application state remained unchanged)
         *
         * @property lastState
         * @type Object
         * @private
         */
        lastStates: undefined,


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

            each(stateComponents, this.updateEntity, this, [currentAppState]);

            this.lastState = currentAppState;
        },

        /** @private */
        updateEntity: function (globalToLocal, entityId, appState) {
            var newState = this.entities.getComponentData(entityId, 'state') || {};

            if (utils.isFunction(globalToLocal)) {
                newState = globalToLocal(appState, newState);

            } else {
                each(globalToLocal, function (localKey, globalPath) {
                    newState[localKey] = immutable.find(appState, globalPath);
                });
            }

            this.entities.setComponent(entityId, 'state', newState);
        }
    });
}());
