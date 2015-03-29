module.exports = function (alchemy) {
    'use strict';

    /**
     * A component system to register/delegate event handler to dom events
     *
     * @class
     * @name alchemy.ecs.EventSystem
     */
    alchemy.formula.add({
        name: 'alchemy.ecs.EventSystem',

    }, function (_super) {
        return {
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
             * The entity storage
             *
             * @property entities
             * @type alchemy.ecs.Apothecarius
             * @private
             */
            entities: undefined,

            /**
             * Hook method to add event handler when defining new entities
             *
             * @param {String} key the entity type identifier
             * @param {Object} entityDescriptor the entity descriptor which should
             *      implement a <code>getEventHandler</code> method if it wants
             *      to add new event handler
             */
            defineEntity: function (key, entityDescriptor) {
                if (!alchemy.isFunction(entityDescriptor.getEventHandler)) {
                    return;
                }

                alchemy.each(entityDescriptor.getEventHandler(), function (handler, key) {
                    this.addHandler(key, handler);
                }, this);
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
             *
             * @param Immutable currentAppState The current application state
             * @param Immutable previousAppState The previous application state
             */
            update: function () {
                var events = this.entities.getAllComponentsOfType('events');
                var ids = [];

                alchemy.each(events, function (cfg) {
                    this.delegateEvents(cfg);
                    ids.push(cfg.id);
                }, this);

                alchemy.each(ids, function (entityId) {
                    this.entities.removeComponent(entityId, 'events');
                }, this);
            },

            /** @private */
            delegateEvents: function (cfg) {
                alchemy.each(cfg, this.delegateEvent, this, [cfg.id]);
            },

            /** @private */
            delegateEvent: function (cfg, eventName, entityId) {
                if (eventName === 'id') {
                    return;
                }

                var handler = this.getEventHandler(entityId, cfg);
                var delegateKey = this.delegator.delegateHandler(eventName, handler);
                var delegatedEvents = this.entities.getComponent(entityId, 'delegatedEvents');

                if (!delegatedEvents) {
                    delegatedEvents = this.entities.addComponent(entityId, 'delegatedEvents', {
                        current: alchemy('alchemy.core.Immutatio').makeImmutable([])
                    });
                }

                delegatedEvents.current = delegatedEvents.current.set(
                    delegatedEvents.current.val().concat({
                        event: eventName,
                        delegate: delegateKey,
                    })
                );
            },

            /** @private */
            getEventHandler: function (entityId, cfg) {
                var handler = this.handler && this.handler[cfg.handler];
                var messages = this.messages;
                var state = this.entities.getComponent(entityId, 'state') || {};

                return function (event) {
                    // console.log('[DEBUG] delegate (id: ' + entityId + ', h: ' + cfg.handler + ', m: ' + cfg.message + ')');
                    if (handler) {
                        var newState = handler(event, state.current);
                        if (newState) {
                            state.current = newState;
                        }
                    }

                    if (cfg.message) {
                        messages.trigger(cfg.message);
                    }
                };
            },
        };
    });
};
