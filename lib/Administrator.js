module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');

    /**
     * Description
     *
     * @class
     * @name alchemy.lib.Administrator
     */
    return coquoVenenum({
        /** @lends alchemy.lib.Administrator.prototype */

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

            this._lastState = state;

            var entities = determineEntities(this.entities, state);

            for (var i = 0, l = this.systems.length; i < l; i++) {
                this.systems[i].update(entities);
            }
        },
    });

    //
    //
    // PRIVATE HELPER

    /** @private */
    function determineEntities(def, state) {
        var result = [];
        var todo = (def(state) || []).reverse();
        var next = null;
        var idx = 0;

        while (todo.length > 0) {
            next = todo.pop();
            result.push(next);

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
