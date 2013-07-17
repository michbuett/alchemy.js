(function () {
    'use strict';

    var alchemy = require('./Alchemy.js');

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
        overrides: {
            /** @lends alchemy.core.Oculus */

            /**
             * The initial set of events;
             * The configuration object has the following form:
             * <pre><code>
             * {
             *      event1: {
             *          fn: {Function} // the handler function
             *          scope: {Object} // the execution scope of the handler
             *      },
             *      event2: {
             *          ...
             *      },
             *      ...
             * }
             * </code></pre>
             *
             * @property events
             * @type Object
             */
            events: undefined,

            /**
             * triggers an event
             *
             * @param {String} eventName
             *      the event name/type
             *
             * @param {Object} data
             *      the event data (can be anything)
             */
            trigger: function (eventName, data) {
                var events = this.events && this.events[eventName];
                var eventObj = this.getEventObject(eventName);
                var listener;
                var i, l;

                // notify listener which are registered for the given event type
                if (events && events.length > 0) {
                    for (i = 0, l = events.length; i < l; i++) {
                        listener = events[i];
                        listener.fn.call(listener.scope, data, eventObj);
                    }
                }
                // notify listener which are registered for all events
                events = this.events && this.events['*'];
                if (events && events.length > 0) {
                    for (i = 0, l = events.length; i < l; i++) {
                        listener = events[i];
                        listener.fn.call(listener.scope, data, eventObj);
                    }
                }
            },

            /**
             * Returns an object with meta data for the given event type
             * @private
             */
            getEventObject: function (eventName) {
                this.eventObj = this.eventObj || {};
                if (!this.eventObj[eventName]) {
                    this.eventObj[eventName] = {
                        name: eventName,
                        source: this
                    };
                }
                return this.eventObj[eventName];
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
             * Adds a one-time listener for to an event; This listener will
             * be removed after the the first execution
             *
             * @param {String} eventName
             *      the event name
             *
             * @param {Function} handler
             *      the event handler method
             *
             * @param {Object} scope
             *      the execution scope for the event handler
             */
            once: function (eventName, handler, scope) {
                var wrapper = function (data, event) {
                    this.off(eventName, wrapper, this);
                    handler.call(scope, data, event);
                };
                this.on(eventName, wrapper, this);
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
             * Determines if the given object can be observed
             * @private
             */
            isObservable: function (obj) {
                return obj && alchemy.isFunction(obj.on) && alchemy.isFunction(obj.off);
            },

            /**
             * Disposes instance;
             * Override superclass to remove registered handler automatically
             */
            dispose: alchemy.override(function (_super) {
                return function () {
                    if (this.observed) {
                        alchemy.each(this.observed, function (cfg) {
                            cfg.obj.off(cfg.event, cfg.fn, cfg.scope);
                        }, this);
                        this.observed = null;
                    }
                    _super.call(this);
                };
            })
        }
    });
}());

