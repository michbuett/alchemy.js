
(function (g) {
    /**
     * @class Alchemy.Oculus
     * @extends Alchemy.MateriaPrima
     *
     * Allows observing of other instances; removes its listeners automatically
     */
    var Oculus = {

        /**
         * Observes the event of a given object
         *
         * @param {Object} obj
         *      the object instance to observe
         *
         * @param {String} event
         *      The event to observe
         *
         * @param {Function} fn
         *      The handler method
         *
         * @param {Object} scope
         *      The execution scope for the handler method
         */
        observe: function (obj, event, fn, scope) {
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
         * Disposes instance;
         * Override superclass to remove registered handler automatically
         */
        dispose: function () {
            if (this.observed) {
                g.Alchemy.each(this.observed, function (cfg) {
                    cfg.obj.off(cfg.event, cfg.fn, cfg.scope);
                }, this);
                this.observed = null;
            }
            _super.call(this);
        }
    };

    g.Alchemy.brew({
        name: 'Oculus',
        ns: 'Alchemy',
        extend: g.Alchemy.MateriaPrima
    }, Oculus);

    /*global process, exports, window*/
}(typeof process === 'undefined' ? window : exports));

