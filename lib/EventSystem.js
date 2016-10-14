module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');

    /**
     * A component system to create delegated event handler for dom events
     *
     * @class
     * @name alchemy.lib.EventSystem
     */
    return coquoVenenum({
        /** @lends alchemy.lib.EventSystem.prototype */

        /**
         * The message bus for the appication messages
         *
         * @property messages
         * @type alchemy.lib.Observari
         * @private
         */
        messages: undefined,

        /**
         * The browser event delegator
         *
         * @property delegator
         * @type alchemy.lib.Delegatus
         * @private
         */
        delegator: undefined,

        /**
         * Updates the component system with the current UI entities
         */
        update: function (entities) {
            for (var i = 0, l = entities.length; i < l; i++) {
                this.delegateEvents(entities[i]);
            }
        },

        /** @private */
        delegateEvents: function (cfg) {
            var events = cfg && cfg.events;
            if (!Array.isArray(events)) {
                return;
            }

            var entityId = cfg.id;
            if (events === this.processed[entityId]) {
                return;
            }

            for (var i = 0, l = events.length; i < l; i++) {
                var e = events[i];
                this.delegateEvent(e[0], e[1], e[2], entityId);
            }

            this.processed[entityId] = events;
        },

        /** @private */
        delegateEvent: function (eventName, filter, handler, entityId) {
            if (typeof eventName !== 'string') {
                return;
            }

            if (typeof handler !== 'function') {
                return;
            }

            var target = eventName + ' #' + entityId;
            if (filter) {
                target += ' ' + filter;
            }

            if (typeof this.handlers[target] !== 'function') {
                var delegate = function handlerDelegate(event) {
                    var handler = this.handlers[target];
                    handler(event, this.sendMessage);
                }.bind(this);

                this.delegator.addEventListener(target, delegate);
            }

            this.handlers[target] = handler;
        },

    }).whenBrewed(function () {

        /**
         * @property handlers
         * @memberOf alchemy.lib.EventSystemNG
         * @type Object
         * @private
         */
        this.handlers = {};

        /**
         * @property sendMessage
         * @memberOf alchemy.lib.EventSystemNG
         * @type Function
         * @private
         */
        this.sendMessage = function sendMessage(msg, data) {
            this.messages.trigger(msg, data);
        }.bind(this);

    }).whenBrewed(function () {
        this.processed = {};

    }).whenDisposed(function () {
        this.handlers = null;
        this.sendMessage = null;
    });
}());
