module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');
    var utils = require('../core/Alchemy');

    /**
     * A component system to create delegated event handler for dom events
     *
     * @class
     * @name alchemy.ecs.EventSystem
     * @extends alchemy.core.MateriaPrima
     */
    return coquoVenenum({
        /** @lends alchemy.ecs.EventSystem.prototype */

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
         * The entity storage
         *
         * @property entities
         * @type alchemy.ecs.Apothecarius
         * @private
         */
        entities: undefined,

        /**
         * Adds a new event handler
         *
         * @param {String} key The identifier for the event handler
         * @param {Function} handler The event handler function to be added
         */
        addHandler: function (key, handler) {
            this.handler = this.handler || {};
            this.handler[key] = handler;
        },

        /**
         * Updates the component system with the current application state
         */
        update: function () {
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
            if (utils.isString(cfg) || utils.isFunction(cfg)) {
                cfg = {
                    handler: cfg
                };
            }

            var handler = this.getEventHandler(entityId, cfg);
            var split = rawEventName.split(/\s/);
            var eventName = split.shift();
            var selector = cfg.selector || split.join(' ');
            var delegate = this.delegator.createDelegate(eventName, handler);
            var delegatedEvents = this.entities.getComponentData(entityId, 'delegatedEvents') || [];

            this.entities.setComponent(entityId, 'delegatedEvents', delegatedEvents.concat({
                event: eventName,
                delegate: delegate,
                selector: selector,
            }));
        },

        /** @private */
        getEventHandler: function (entityId, cfg) {
            var handler = cfg.handler;
            var repo = this.entities;
            var messages = this.messages;
            var sendMessage = function (msg, data) {
                messages.trigger(msg, data);
            };

            if (utils.isString(handler)) {
                handler = this.handler && this.handler[cfg.handler];
            }

            return function (event) {
                var state, newState;

                if (utils.isFunction(handler)) {
                    state = repo.getComponent(entityId, 'state');
                    newState = handler(event, state, sendMessage);

                    if (typeof newState !== 'undefined') {
                        repo.setComponent(entityId, 'state', newState);
                    }
                }

                if (cfg.message) {
                    state = repo.getComponentData(entityId, 'state');
                    sendMessage(cfg.message, state);
                }
            };
        },
    });
}());
