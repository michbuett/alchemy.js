module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');

    /**
     * A component system to create delegated event handler for dom events
     *
     * @class
     * @name alchemy.ecs.EventSystemNG
     */
    return coquoVenenum({
        /** @lends alchemy.ecs.EventSystemNG.prototype */

        /**
         * The message bus for the appication messages
         *
         * @property messages
         * @type alchemy.core.Observari
         * @private
         */
        messages: undefined,

        /**
         * The browser event delegator
         *
         * @property delegator
         * @type alchemy.web.Delegatus
         * @private
         */
        delegator: undefined,

        /**
         * Updates the component system with the current UI entities
         */
        update: function (entities) {
            entities.forEach(this.delegateEvents, this);
        },

        /** @private */
        delegateEvents: function (cfg, entityId) {
            if (!cfg.events) {
                return;
            }

            each(cfg.events, this.delegateEvent, this, [entityId]);
        },

        /** @private */
        delegateEvent: function (handler, rawEventName, entityId) {
            if (typeof handler !== 'function') {
                return;
            }

            var target = this.getTarget(rawEventName, entityId);

            if (!this.handlers.has(target)) {
                var delegate = function handlerDelegate(event) {
                    var handler = this.handlers.get(target);
                    handler(event, this.sendMessage);
                }.bind(this);

                this.delegator.addEventListener(target, delegate);
            }

            this.handlers.set(target, handler);
        },

        /** @private */
        getTarget: function (rawEventName, entityId) {
            var split = rawEventName.replace(/^\s*/, '').replace(/\s*$/, '').split(/\s+/);
            return [split.shift()].concat('#' + entityId).concat(split).join(' ');
        },

    }).whenBrewed(function () {

        /**
         * @property handlers
         * @memberOf alchemy.ecs.EventSystemNG
         * @type Map
         * @private
         */
        this.handlers = new Map();

        /**
         * @property sendMessage
         * @memberOf alchemy.ecs.EventSystemNG
         * @type Function
         * @private
         */
        this.sendMessage = function sendMessage(msg, data) {
            this.messages.trigger(msg, data);
        }.bind(this);

    }).whenDisposed(function () {
        this.handlers = null;
        this.sendMessage = null;
    });
}());
