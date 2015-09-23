module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');
    var utils = require('./Alchemy.js');

    var Observari = {
        /** @lends alchemy.core.Observari.prototype */

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
         * Triggers an event
         * @function
         *
         * @param {String} eventName The event name/type
         * @param {Object} data The event data (can be anything)
         */
        trigger: (function () {
            var processListener = function (listener, index, data, eventObj) {
                listener.fn.call(listener.scope, data, eventObj);
            };

            return function (eventName, data) {
                var listeners = this.events && utils.mix([], this.events[eventName]);
                var eventObj = getEventObject(this, eventName);
                var args = [data, eventObj];

                // notify listener which are registered for the given event type
                each(listeners, processListener, this, args);

                // notify listener which are registered for all events
                listeners = this.events && this.events['*'];
                each(listeners, processListener, this, args);
            };
        }()),


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
                each(this.events, function (eventListner, eventName) {
                    cleanlistenerList(this, eventName, handler, scope);
                }, this);
            }
        },
    };

    ///////////////////////////////////////////////////////////////////////////
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

    return coquoVenenum(Observari).whenDisposed(function () {
        // remove all listeners
        this.off();

        // cut circle references form the eventObj
        each(this.eventObj, function (item) {
            item.name = null;
            item.source = null;
        });
        this.eventObj = null;
    });
}());
