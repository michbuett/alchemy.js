module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');

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
            if (!events) {
                return;
            }

            var entityId = cfg.id;
            if (events === this.processed[entityId]) {
                return;
            }

            each(events, this.delegateEvent, this, [entityId]);
            this.processed[entityId] = events;
        },

        /** @private */
        delegateEvent: function (handler, rawEventName, entityId) {
            if (typeof handler !== 'function') {
                return;
            }

            var target = this.getTarget(rawEventName, entityId);

            if (typeof this.handlers[target] !== 'function') {
                var delegate = function handlerDelegate(event) {
                    var handler = this.handlers[target];
                    handler(event, this.sendMessage);
                }.bind(this);

                this.delegator.addEventListener(target, delegate);
            }

            this.handlers[target] = handler;
        },

        /** @private */
        getTarget: function (rawEventName, entityId) {
            var split = rawEventName.replace(/^\s*/, '').replace(/\s*$/, '').split(/\s+/);
            return [split.shift()].concat('#' + entityId).concat(split).join(' ');
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
