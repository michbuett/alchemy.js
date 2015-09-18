module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');

    /**
     * @class
     * @name alchemy.web.Delegatus
     */
    return coquoVenenum({
        /** @lends alchemy.web.Delegatus.prototype */

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
         * @deprecated
         */
        delegate: function (el, event, fn, scope) {
            if (el && event && fn) {
                this.delegateHandler(event, fn, scope, el);
            }
        },

        delegateHandler: function (event, fn, scope, element) {
            var key = this.createHandleDelegate(event, fn, scope);
            if (element) {
                this.delegateKey(event, key, element);
            }
            return key;
        },

        delegateKey: function (event, key, element) {
            element[this.getKey(event)] = key;
        },

        //
        //
        // private helper
        //
        //

        /** @private */
        getKey: function (eventname) {
            return '__e__' + eventname;
        },

        /** @private */
        handleEvent: function (eventName, ev) {
            var target = ev && ev.target;

            while (target) {
                this.dispatchEvent(target[this.getKey(eventName)], eventName, ev);
                target = target.parentNode;
            }
        },

        /** @private */
        dispatchEvent: function (eventKey, eventName, event) {
            if (typeof eventKey === 'undefined') {
                return;
            }

            var handler = this.events[eventName];
            var cfg = handler && handler[eventKey];

            cfg.fn.call(cfg.scope, event);
        },

        /** @private */
        createHandleDelegate: function (event, fn, scope) {
            var handler = this.events[event];
            if (!handler) {
                // first handler for this event
                var self = this;

                handler = [];

                this.events[event] = handler;
                this.root['on' + event] = function (e) {
                    self.handleEvent(event, e);
                };
            }

            for (var i = 0, l = handler.length; i < l; i++) {
                if (handler[i].fn === fn && handler[i].scope === scope) {
                    // event handler was already defined
                    // -> use it
                    return i;
                }
            }

            handler.push({
                fn: fn,
                scope: scope
            });

            return handler.length - 1;
        },

    }).whenBrewed(function () {
        this.root = this.root || document.body;
        this.events = {};

    }).whenDisposed(function () {
        each(this.events, function (handler, event) {
            while (handler.length > 0) {
                handler.pop();
            }

            this.root['on' + event] = null;
        }, this);

    });
}());
