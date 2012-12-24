(function () {
    'use strict';

    var alchemy = require('./Alchemy.js');

    /**
     * This is a an observable potion that also allows observing other
     * potions. It can remove its events automatically
     *
     * @class Oculus
     * @extends MateriaPrima
     */
    alchemy.formula.add({
        name: 'Oculus',
        extend: 'MateriaPrima',
        overrides: {

            /**
             * @cfg {Object} events
             * the initial set of events; the configuration object has the
             * following form:
             * <pre><code>
             * {
             *      event1: {
             *          fn: <Function> // the handler function
             *          scope: <Object> // the execution scope of the handler
             *      },
             *      event2: {
             *          ...
             *      },
             *      ...
             * }
             * </code></pre>
             */
            events: undefined,

            /**
             * triggers an event
             *
             * @param {String} event
             *      the event name/type
             *
             * @param {Object} data
             *      the event data (can be anything)
             */
            trigger: function (event, data) {
                var events = this.events && this.events[event];
                var listener;
                if (events && events.length > 0) {
                    for (var i = 0; i < events.length; i++) {
                        listener = events[i];
                        listener.fn.call(listener.scope, data);
                    }
                }
            },

            /**
             * adds a listener for to an event
             *
             * @param {String} event
             *      the event name
             *
             * @param {Function} handler
             *      the event handler method
             *
             * @param {Object} scope
             *      the execution scope for the event handler
             */
            on: function (event, handler, scope) {
                this.events = this.events || {};
                this.events[event] = this.events[event] || [];
                this.events[event].push({
                    fn: handler,
                    scope: scope
                });
            },

            /**
             * removes a listener for from an event
             *
             * @param {String} event
             *      the event name
             *
             * @param {Function} handler
             *      the event handler method
             *
             * @param {Object} scope
             *      the execution scope for the event handler
             */
            off: function (event, handler, scope) {
                if (event) {
                    this.cleanlistenerList(event, handler, scope);
                } else {
                    alchemy.each(this.events, function (eventListner, eventName) {
                        this.cleanlistenerList(eventName, handler, scope);
                    }, this);
                }
            },

            /**
             * Purges the list of event handlers from the given listeners
             * @private
             */
            cleanlistenerList: function (event, fn, scope) {
                var listener;
                var oldList = (this.events && this.events[event]) || [];
                var newList = [];
                var match; // true if the listener (fn, scope) is registered for the event

                for (var i = 0; i < oldList.length; i++) {
                    listener = oldList[i];
                    match = (!fn || fn === listener.fn) && (!scope || scope === listener.scope);

                    if (!match) {
                        newList.push(listener);
                    }
                }
                if (newList.length > 0) {
                    this.events[event] = newList;
                } else {
                    delete this.events[event];
                }
            },

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
                    alchemy.each(this.observed, function (cfg) {
                        cfg.obj.off(cfg.event, cfg.fn, cfg.scope);
                    }, this);
                    this.observed = null;
                }
                _super.call(this);
            }
        }
    });
}());

