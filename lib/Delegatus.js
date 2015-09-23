module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');

    var Delegate = function (key, event, handler, scope) {
        this.key = key;
        this.event = event;
        this.handler = handler;
        this.scope = scope;
    };

    Delegate.prototype.bind = function bind(element) {
        element[getKey(this.event)] = this.key;
    };

        /** @private */
    function getKey(eventname) {
        return '__e__' + eventname;
    }

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

        createDelegate: function (event, fn, scope) {
            var delegates = this.events[event];

            if (!delegates) {
                // first handler for this event
                var self = this;

                delegates = [];

                this.events[event] = delegates;
                this.root['on' + event] = function (e) {
                    self.handleEvent(event, e);
                };
            }

            for (var i = 0, l = delegates.length; i < l; i++) {
                var d = delegates[i];
                if (d.handler === fn && d.scope === scope) {
                    // event handler was already defined
                    // -> use it
                    return d;
                }
            }

            var newDel = new Delegate(delegates.length, event, fn, scope);

            delegates.push(newDel);

            return newDel;
        },

        //
        //
        // private helper
        //
        //

        /** @private */
        handleEvent: function (eventName, ev) {
            var target = ev && ev.target;

            while (target) {
                this.dispatchEvent(target[getKey(eventName)], eventName, ev);
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

            cfg.handler.call(cfg.scope, event);
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
