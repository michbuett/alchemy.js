module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');

    /**
     * @class
     * @name alchemy.lib.Delegatus
     */
    return coquoVenenum({
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
         * The set of registered event handlers
         *
         * @property events
         * @type Object
         * @private
         */
        events: undefined,

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
        getDelegateList: function (event, element) {
            if (!this.events[event]) {
                // first handler for this event
                var self = this;

                this.events[event] = [];
                this.root['on' + event] = function (e) {
                    self.handleEvent(event, e);
                };
            }

            this.events[event][element] = this.events[event][element] || [];

            return this.events[event][element];
        },

        /** @private */
        handleEvent: function (eventName, ev) {
            var target = ev && ev.target;

            while (target) {
                var delegates = this.findDelegates(eventName, target);
                each(delegates, this.delegateEvent, this, [ev, target]);

                target = target.parentNode;
            }
        },

        /** @private */
        delegateEvent: function (delegate, key, ev, target) {
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
        this.events = {};

    }).whenDisposed(function () {
        each(this.events, function (handler, event) {
            this.events[event] = null;
            this.root['on' + event] = null;
        }, this);

        this.events = null;
        this.root = null;
    });
}());
