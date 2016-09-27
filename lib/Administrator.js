module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');

    /**
     * Description
     *
     * @class
     * @name alchemy.ecs.Administrator
     */
    return coquoVenenum({
        /** @lends alchemy.ecs.Administrator.prototype */

        /**
         * A functions which defines the existing entities based on the current
         * application state
         *
         * @property entities
         * @type Function
         */
        entities: undefined,

        /**
         * Updates all registered systems and existing entities with the current
         * application state
         *
         * @param {Immutatable} state The current application state
         */
        update: function (state) {
            if (state === this._lastState) {
                return;
            }

            this._lastEntities = this._entities;
            this._lastState = state;
            this._entities = determineEntities(this.entities, state);

            for (var i = 0, l = this.systems.length; i < l; i++) {
                this.systems[i].update(this._entities);
            }
        },
    });

    //
    //
    // PRIVATE HELPER

    /** @private */
    function determineEntities(def, state) {
        var result = new Map();
        var todo = (def(state) || []).reverse();
        var next = null;
        var idx = 0;

        while (todo.length > 0) {
            next = todo.pop();
            result.set(next.id, next);

            if (next.children) {
                for (var i = next.children.length - 1; i >= 0; i--) {
                    todo.push(next.children[i]);
                }
            }
            idx++;
        }

        return result;
    }
}());
