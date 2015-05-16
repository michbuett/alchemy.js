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
            },

            /** @override */
            dispose: function () {
                this.messages = null;
                this.entities = null;
                this.delegator = null;

                MateriaPrima.dispose.call(this);
            },

            /**
             * Hook method to add event handler when defining new entities
             *
             * @param {String} key the entity type identifier
             * @param {Object} entityDescriptor the entity descriptor which should
             *      implement a <code>getEventHandler</code> method if it wants
             *      to add new event handler
             */
            defineEntityType: function (key, entityDescriptor) {
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
            delegateEvent: function (cfg, eventName, entityId) {
                var handler = this.getEventHandler(entityId, cfg);
                var delegateKey = this.delegator.delegateHandler(eventName, handler);
                var delegatedEvents = this.entities.getComponentData(entityId, 'delegatedEvents') || [];

                this.entities.setComponent(entityId, 'delegatedEvents', delegatedEvents.concat({
                    event: eventName,
                    delegate: delegateKey,
                }));
            },

            /** @private */
            getEventHandler: function (entityId, cfg) {
                var handler = this.handler && this.handler[cfg.handler];
                var messages = this.messages;
                var repo = this.entities;

                return function (event) {
                    var state, newState;

                    if (handler) {
                        state = repo.getComponentData(entityId, 'state');
                        newState = handler(event, state);

                        if (typeof newState !== 'undefined') {
                            repo.setComponent(entityId, 'state', newState);
                        }
                    }

                    if (cfg.message) {
                        state = repo.getComponentData(entityId, 'state');
                        messages.trigger(cfg.message, state);
                    }
                };
            },
        });
    });
};
