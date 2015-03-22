(function () {
    'use strict';

    var alchemy = require('./../core/Alchemy.js');

    /**
     * @class
     * @name alchemy.web.Delegatus
     */
    alchemy.formula.add({
        name: 'alchemy.web.Delegatus',
        overrides: function (_super) {
            return {

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

                constructor: function (cfg) {
                    _super.constructor.call(this, cfg);

                    this.root = this.root || document.body;
                    this.events = {};
                },

                /**
                 * Override super potion to clear event handler
                 */
                dispose: function () {
                    alchemy.each(this.events, function (handler, event) {
                        while (handler.length > 0) {
                            handler.pop();
                        }

                        this.root['on' + event] = null;
                    }, this);

                    this.events = null;
                    this.root = null;

                    _super.dispose.call(this);
                },

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
                    var eventKey = target && target[this.getKey(eventName)];
                    if (typeof eventKey === 'undefined') {
                        return;
                    }

                    var handler = this.events[eventName];
                    var cfg = handler && handler[eventKey];
                    if (cfg) {
                        cfg.fn.call(cfg.scope, ev);
                    }
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
                        if (handler[i].fn === fn && (handler[i].scope === scope || !scope)) {
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
            };
        }
    });
}());
