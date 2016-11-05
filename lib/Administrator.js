module.exports = (function () {
    'use strict';

    var formula = require('./Formula');

    /**
     * Description
     *
     * @class
     * @name alchemy.lib.Administrator
     */
    return formula({
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
        update: function (state, deltas) {
            if (state === this._lastState) {
                return;
            }

            this._lastState = state;

            var entities = determineEntities(this.entities, state, deltas);

            for (var i = 0, l = this.systems.length; i < l; i++) {
                this.systems[i].update(entities);
            }
        },
    });

    //
    //
    // PRIVATE HELPER

    /** @private */
    function determineEntities(def, state, deltas) {
        var result = [];
        var todo = (def(state, deltas) || []).reverse();
        var next, children;

        while (todo.length > 0) {
            next = todo.pop();
            children = next.children;
            result.push(next);

            if (typeof children === 'function') {
                children = children(state, deltas);
            }

            if (Array.isArray(children)) {
                for (var i = children.length - 1; i >= 0; i--) {
                    todo.push(children[i]);
                }
            }
        }

        return result;
    }
}());
