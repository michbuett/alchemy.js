(function () {
    'use strict';

    var alchemy = require('./Alchemy.js');

    /**
     * The basic mixin for an event emitter which can be observe using event
     * handlers ("observari" is a passiv form of "observare", latin "to observe")
     *
     * @class
     * @name alchemy.core.Observari
     * @extends alchemy.core.Ingredient
     */
    alchemy.formula.add({
        name: 'alchemy.core.Observari',
        alias: 'Observari',
        overrides: function () {
            /** @lends alchemy.core.Observari */

            //
            //
            // private helper
            //
            //

            /**
             * Returns an object with meta data for the given event type
             * @private
             */
            function getEventObject(observable, eventName) {
                observable.eventObj = observable.eventObj || {};
                if (!observable.eventObj[eventName]) {
                    observable.eventObj[eventName] = {
                        name: eventName,
                        source: observable
                    };
                }
                return observable.eventObj[eventName];
            }

            /**
             * Purges the list of event handlers from the given listeners
             * @private
             */
            function cleanlistenerList(observable, event, fn, scope) {
                var oldList = (observable.events && observable.events[event]) || [];
                var newList = [];
                var match; // true if the listener (fn, scope) is registered for the event
                var listener = oldList.pop();

                while (listener) {
                    match = (!fn || fn === listener.fn) && (!scope || scope === listener.scope);

                    if (!match) {
                        newList.push(listener);
                    } else {
                        listener.fn = null;
                        listener.scope = null;
                    }
                    listener = oldList.pop();
                }
                if (newList.length > 0) {
                    observable.events[event] = newList;
                } else {
                    delete observable.events[event];
                }
            }

            return {
                /** @lends alchemy.core.Observari.prototype */

                publics: ['on', 'once', 'off', 'trigger'],

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
                    var eventObj = getEventObject(this, eventName);
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
                        cleanlistenerList(this, event, handler, scope);
                    } else {
                        alchemy.each(this.events, function (eventListner, eventName) {
                            cleanlistenerList(this, eventName, handler, scope);
                        }, this);
                    }
                },

                /** @protected */
                finish: function () {
                    // remove all listeners
                    this.off();

                    // cut circle references form the eventObj
                    alchemy.each(this.eventObj, function (item) {
                        item.name = null;
                        item.source = null;
                    });
                    this.eventObj = null;
                },

            };
        }
    });
}());
