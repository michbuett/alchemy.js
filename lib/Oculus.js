module.exports = (function () {
    'use strict';

    var formula = require('./Formula');
    var each = require('pro-singulis');
    var utils = require('./Utils');

    var Oculus = {
        /** @lends alchemy.lib.Oculus */

        /**
         * Observes the event of a given object
         *
         * @param {Object} obj The object instance to observe
         * @param {String} event The event to observe
         * @param {Function} fn The handler method
         * @param {Object} scope The execution scope for the handler method
         */
        observe: function (obj, event, fn, scope) {
            if (!this.isObservable(obj)) {
                return;
            }

            this.observed = this.observed || [];
            this.observed.push({
                obj: obj,
                event: event,
                fn: fn,
                scope: scope
            });

            obj.on(event, fn, scope);
        },

        /**
         * Determines if the given object can be observed, i.e. the given
         * object must provide a method "on" to register an event handler
         * and a method named "off" to remove the handler
         *
         * @param {Object} obj The object which should be observed
         * @return {Boolean} <code>true</code> if and only if the given
         *      Object can be observed using the oculus
         */
        isObservable: function (obj) {
            return obj && utils.isFunction(obj.on) && utils.isFunction(obj.off);
        },
    };

    return formula(Oculus).whenDisposed(function () {
        if (this.observed) {
            each(this.observed, function (cfg) {
                cfg.obj.off(cfg.event, cfg.fn, cfg.scope);
            }, this);

            this.observed = null;
        }
    });
}());
