module.exports = function (alchemy) {
    'use strict';

    /**
     * This is a an observable potion that also allows observing other
     * potions. It can remove its events automatically
     *
     * @class
     * @name alchemy.core.Oculus
     * @extends alchemy.core.MateriaPrima
     */
    alchemy.formula.add({
        name: 'alchemy.core.Oculus',
        alias: 'Oculus',
        extend: 'alchemy.core.MateriaPrima',

    }, function (_super) {
        return {
            /** @lends alchemy.core.Oculus */

            publics: ['observe', 'isObservable'],

            /**
             * Observes the event of a given object
             *
             * @param {Object} obj The object instance to observe
             * @param {String} event The event to observe
             * @param {Function} fn The handler method
             * @param {Object} scope The execution scope for the handler method
             */
            observe: function (obj, event, fn, scope) {
                if (this.isObservable(obj)) {
                    this.observed = this.observed || [];
                    this.observed.push({
                        obj: obj,
                        event: event,
                        fn: fn,
                        scope: scope
                    });
                    obj.on(event, fn, scope);
                }
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
                return obj && alchemy.isFunction(obj.on) && alchemy.isFunction(obj.off);
            },

            /**
             * Disposes instance;
             * Override superclass to remove registered handler automatically
             */
            dispose: function () {
                if (this.observed) {
                    alchemy.each(this.observed, function (cfg) {
                        cfg.obj.off(cfg.event, cfg.fn, cfg.scope);
                    }, this);

                    this.observed = null;
                }

                _super.dispose.call(this);
            }
        };
    });
};
