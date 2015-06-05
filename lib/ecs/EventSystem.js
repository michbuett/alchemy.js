module.exports = function (alchemy) {
    'use strict';

    /**
     * A component system to register/delegate event handler to dom events
     *
     * @class
     * @name alchemy.ecs.EventSystem
     * @extends alchemy.core.MateriaPrima
     */
    alchemy.formula.define('alchemy.ecs.EventSystem', [
        'alchemy.core.MateriaPrima',

    ], function (MateriaPrima) {

        return alchemy.extend(MateriaPrima, {
            /** @lends alchemy.ecs.EventSystem.prototype */

            /** @override */
            constructor: function (cfg) {
                /**
                 * The message bus for the appication messages
                 *
                 * @property messages
                 * @type alchemy.core.Observari
                 * @private
                 */
                this.messages = undefined;

                /**
                 * The browser event delegator
                 *
                 * @property delegator
                 * @type alchemy.web.Delegatus
                 * @private
                 */
                this.delegator = undefined;

                /**
                 * The entity storage
                 *
                 * @property entities
                 * @type alchemy.ecs.Apothecarius
                 * @private
                 */
                this.entities = undefined;

                MateriaPrima.constructor.call(this, cfg);

                var messages = this.messages;

                /**
                 * @function
                 * @private
                 */
                this.sendMessage = function (msg, data) {
                    messages.trigger(msg, data);
                };
            },

            /** @override */
            dispose: function () {
                this.messages = null;
                this.entities = null;
                this.delegator = null;
                this.sendMessage = null;

                MateriaPrima.dispose.call(this);
            },

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
                alchemy.each(events, this.delegateEvents, this);
            },

            /** @private */
            delegateEvents: function (cfg, entityId) {
                alchemy.each(cfg, this.delegateEvent, this, [entityId]);
                this.entities.removeComponent(entityId, 'events');
            },

            /** @private */
            delegateEvent: function (cfg, rawEventName, entityId) {
                if (alchemy.isString(cfg) || alchemy.isFunction(cfg)) {
                    cfg = {
                        handler: cfg
                    };
                }

                var handler = this.getEventHandler(entityId, cfg);
                var split = rawEventName.split(/\s/);
                var eventName = split.shift();
                var selector = cfg.selector || split.join(' ');
                var delegateKey = this.delegator.delegateHandler(eventName, handler);
                var delegatedEvents = this.entities.getComponentData(entityId, 'delegatedEvents') || [];

                this.entities.setComponent(entityId, 'delegatedEvents', delegatedEvents.concat({
                    event: eventName,
                    delegate: delegateKey,
                    selector: selector,
                }));
            },

            /** @private */
            getEventHandler: function (entityId, cfg) {
                var handler = cfg.handler;
                var sendMessage = this.sendMessage;
                var repo = this.entities;

                if (alchemy.isString(handler)) {
                    handler = this.handler && this.handler[cfg.handler];
                }

                return function (event) {
                    var state, newState;

                    if (alchemy.isFunction(handler)) {
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
    });
};
