module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');

    /**
     * A component system to create delegated event handler for dom events
     *
     * @class
     * @name alchemy.old.EventSystem
     * @extends alchemy.old.MateriaPrima
     */
    return coquoVenenum({
        /** @lends alchemy.old.EventSystem.prototype */

        /**
         * The message bus for the appication messages
         *
         * @property messages
         * @type alchemy.old.Observari
         * @private
         */
        messages: undefined,

        /**
         * The browser event delegator
         *
         * @property delegator
         * @type alchemy.old.Delegatus
         * @private
         */
        delegator: undefined,

        /**
         * The entity storage
         *
         * @property entities
         * @type alchemy.old.Apothecarius
         * @private
         */
        entities: undefined,

        /**
         * The current application state
         *
         * @property appState
         * @type Immutablis
         * @private
         */
        appState: undefined,

        /**
         * Updates the component system with the current application state
         * @param Immutablis state The current application state
         */
        update: function (state) {
            this.appState = state;

            var events = this.entities.getAllComponentsOfType('events');

            each(events, this.delegateEvents, this);
        },

        /** @private */
        delegateEvents: function (cfg, entityId) {
            each(cfg, this.delegateEvent, this, [entityId]);
            this.entities.removeComponent(entityId, 'events');
        },

        /** @private */
        delegateEvent: function (cfg, rawEventName, entityId) {
            var handler = this.getEventHandler(entityId, cfg);
            var split = rawEventName.replace(/^\s*/, '').replace(/\s*$/, '').split(/\s+/);
            var target = [split.shift()].concat('#' + entityId).concat(split).join(' ');

            this.delegator.addEventListener(target, handler);
        },

        /** @private */
        getEventHandler: function (entityId, cfg) {
            if (typeof cfg === 'string') {
                cfg = {
                    message: cfg
                };
            }

            if (typeof cfg === 'function') {
                cfg = {
                    handler: cfg,
                };
            }

            var handler = cfg.handler;
            var state = this.appState;
            var messages = this.messages;
            var sendMessage = function (msg, data) {
                messages.trigger(msg, data);
            };

            return function (event) {
                if (typeof handler === 'function') {
                    handler(event, state, sendMessage);
                }

                if (cfg.message) {
                    sendMessage(cfg.message, state);
                }
            };
        },
    });
}());
