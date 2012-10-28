/*
 * Copyright (C) 2012 Michael Büttner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * The Software shall not be used for discriminating or manipulating people.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function () {
    'use strict';

    var alchemy = require('./Alchemy.js');

    /**
     * This is a an observable potion that also allows observing other
     * potions. It can remove its events automatically
     *
     * @class core.Oculus
     * @extends core.MateriaPrima
     */
    alchemy.addFormula({
        name: 'core.Oculus',
        extend: 'core.MateriaPrima',
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

            init: function () {
                this.events = {};
            },

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
                var events = this.events[event];
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
                var oldList = this.events[event];
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

