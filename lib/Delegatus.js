module.exports = (function () {
    'use strict';

    var formula = require('./Formula');
    var each = require('pro-singulis');

    /**
     * @class
     * @name alchemy.lib.Delegatus
     */
    return formula({
        /** @lends alchemy.lib.Delegatus.prototype */

        /**
         * The root DOM node that collects the browser events
         *
         * @property root
         * @type DomNode
         * @readonly
         */
        root: undefined,

        /**
         * Registers a new event listner
         *
         * @param {String} target The event target descriptor (e.g. "keydown", "click #foo .bar")
         * @param {Function} fn The event handler method
         * @param {Object} [scope] Optional. The execution context
         */
        addEventListener: function (target, fn, scope) {
            var parsedTarget = this.parseTarget(target);
            var event = parsedTarget.event;
            var element = parsedTarget.element;
            var filter = parsedTarget.filter;

            var delegates = this.getDelegateList(event, element);

            delegates.push({
                handler: fn,
                scope: scope,
                filter: filter,
            });
        },

        //
        //
        // private helper
        //
        //

        /** @private */
        parseTarget: function (target) {
            var split = target.split(/\s+/);

            return {
                event: split[0],
                element: split[1].replace(/^.*#/, ''),
                filter: split.slice(2).join(' '),
            };
        },

        /** @private */
        getDelegateList: function (eventName, element) {
            if (!this.events[eventName]) {
                // first handler for this event
                var self = this;

                this.events[eventName] = [];
                this.handlers[eventName] = function (e) {
                    self.handleEvent(eventName, e);
                    e.stopPropagation();
                };
                this.root.addEventListener(eventName, this.handlers[eventName], true);
            }

            this.events[eventName][element] = this.events[eventName][element] || [];

            return this.events[eventName][element];
        },

        /** @private */
        handleEvent: function (eventName, ev) {
            var target = ev && ev.target;

            while (target) {
                var delegates = this.findDelegates(eventName, target);

                if (delegates && delegates.length > 0) {
                    for (var i = 0, l = delegates.length; i < l; i++) {
                        this.delegateEvent(delegates[i], ev, target);
                    }
                }

                target = target.parentNode;
            }
        },

        /** @private */
        delegateEvent: function (delegate, ev, target) {
            if (this.isFiltered(delegate.filter, target, ev.target)) {
                return;
            }

            delegate.handler.call(delegate.scope, ev);
        },

        /** @private */
        isFiltered: function (filter, node, eventTarget) {
            if (!filter) {
                return false;
            }

            var childNodes = node.querySelectorAll(filter);
            for (var i = 0, l = childNodes.length; i < l; i++) {
                if (eventTarget === childNodes[i]) {
                    return false;
                }
            }

            return true;
        },

        /** @private */
        findDelegates: function (eventName, target) {
            var delegates = this.events[eventName];
            var delegate = delegates && delegates[target.id];

            return delegate;

        },

    }).whenBrewed(function () {
        this.root = this.root || document.body;

        /**
         * The set of registered event handlers
         *
         * @property events
         * @type Object
         * @private
         */
        this.events = {};

        /**
         * The actual handler methods which delegate the events
         *
         * @property handlers
         * @type Object
         * @private
         */
        this.handlers = {};

    }).whenDisposed(function () {
        each(this.handlers, function (handler, event) {
            this.root.removeEventListener(event, handler, true);
            this.events[event] = null;
            this.handlers[event] = null;
        }, this);

        this.events = null;
        this.root = null;
    });
}());
