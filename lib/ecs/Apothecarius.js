module.exports = function (alchemy) {
    'use strict';

    /**
     * The primary entity manager (an apothecarius is a storage manager)
     * "One potion to rule them all, one potion to find them,
     * one potion to bring them all and in the darkness bind them"
     *
     * @class
     * @name alchemy.ecs.Apothecarius
     */
    alchemy.formula.add({
        name: 'alchemy.ecs.Apothecarius',
        requires: [
            'alchemy.core.Collectum',
        ],

    }, function (_super) {
        return {
            /** @lends alchemy.ecs.Apothecarius.prototype */

            /** @protected */
            constructor: function (cfg) {
                /**
                 * The sets of different components (map component
                 * type name -> collection of component instance)
                 *
                 * @property components
                 * @type {Object}
                 * @private
                 */
                this.components = {};

                /**
                 * The set of component defaults (map entityType -> default values)
                 *
                 * @property defaults
                 * @type Object
                 * @private
                 */
                this.defaults = {};

                /**
                 * The collection of registered entities; eah entity is an object with
                 * an <code>id</code> and an array of strings (<code>components</code>)
                 * which refer the entity's components
                 *
                 * @property entities
                 * @type {alchemy.core.Collectum}
                 * @private
                 */
                this.entities = alchemy('Collectum').brew();

                _super.constructor.call(this, cfg);
            },

            /** @protected */
            dispose: function () {
                this.removeAllEntities();
                this.components = null;
                this.defaults = null;
                this.entities = null;

                _super.dispose.call(this);
            },

            /**
             * Creates a new entity (a set of components)
             *
             * @param {String|Object} cfg The entity type or a custom component
             *      configurations
             * @param {String} [cfg.id] Optional. An entity ID. If ommitted a new
             *      one will be created
             * @param {String} [cfg.type] Optional. An entity type.
             * @return {String} The id of the new entity
             */
            createEntity: function (cfg) {
                if (alchemy.isString(cfg)) {
                    cfg = {
                        type: cfg
                    };
                }

                if (!alchemy.isObject(cfg)) {
                    cfg = {};
                }

                var entityId = cfg.id || alchemy.id();
                if (this.entities.contains(entityId)) {
                    throw 'The id: "' + entityId + '" is already used';
                }

                var type = cfg.type;
                var defaults = this.defaults[type] || {};
                var componentKeys = alchemy.union(Object.keys(defaults), Object.keys(cfg));

                this.entities.add({
                    id: entityId,
                    type: type,
                    components: [],
                });

                // create the components of the new entity
                alchemy.each(componentKeys, function (key) {
                    if (key === 'id' || key === 'type') {
                        return;
                    }

                    this.addComponent(entityId, key, alchemy.mix({}, defaults[key], cfg[key]));
                }, this);

                return entityId;
            },

            /**
             * Defines a new entity type (default values for all further entites
             * of this type
             *
             * @param {String} entityType The indentifier of the new entity type
             * @param {Object} provider The provider of the component defaults
             *      It should implement the "getComponents" method
             */
            defineEntityType: function (entityType, provider) {
                if (this.defaults[entityType]) {
                    throw 'The entity type "' + entityType + '" is already defined!';
                }

                if (!alchemy.isFunction(provider.getComponents)) {
                    return;
                }

                this.defaults[entityType] = provider.getComponents();
            },

            /**
             * Add a component to an entity
             *
             * @param {String} entityId The entity identifier
             * @param {String} key The component identifier
             * @param {Object} cfg The component configuration
             * @return {Object} The added component object
             */
            addComponent: function (entityId, key, cfg) {
                var entity = this.entities.get(entityId);
                if (!entity) {
                    throw 'Unknown entity: "' + entityId + '"';
                }

                var collection = this.components[key];
                if (!collection) {
                    // it's the first component of this type
                    // -> create a new collection
                    collection = alchemy('Collectum').brew();
                    this.components[key] = collection;
                }

                var cmp = alchemy.mix({}, cfg, {
                    id: entityId, // use the entity id to reference each component
                });

                // store the component
                collection.add(cmp);
                entity.components.push(key);

                return cmp;
            },

            /**
             * Checks if an entity with the given id exists
             * @return Boolean
             */
            contains: function (entityId) {
                return this.entities.contains(entityId);
            },

            /**
             * Completely removes all existing entities and their
             * components - The total clean-up - The end of days...
             */
            removeAllEntities: function () {
                this.entities.each(this.removeEntity, this);
            },

            /**
             * Removes an entity and all its components
             *
             * @param {String} entity The id of entity to remove
             */
            removeEntity: function (entityId) {
                var entity = alchemy.isObject(entityId) ? entityId : this.entities.get(entityId);
                if (!alchemy.isObject(entity)) {
                    return;
                }

                var cmps = entity.components;
                while (cmps.length > 0) {
                    this.removeComponent(entity, cmps[0]);
                }

                this.entities.remove(entity);
            },

            /**
             * Removes a single component of an entity; The removed component is disposed
             * if it is a potion
             *
             * @param {String|Object} entity The entity object or its id (It is recommended to use
             *      the ids for public access!!!)
             * @param {String|Number} type The component type to remove or its index (the index
             *      is for private usage!!!)
             */
            removeComponent: function (entityId, type) {
                var entity = alchemy.isObject(entityId) ? entityId : this.entities.get(entityId);
                if (!alchemy.isObject(entity)) {
                    throw 'Unknown entity: "' + entityId + '"';
                }

                var index = entity.components.indexOf(type);
                if (index >= 0) {
                    entity.components.splice(index, 1);
                }

                var collection = this.components[type];
                if (collection) {
                    collection.remove(entityId);
                }
            },

            /**
             * Returns an array containing all components of a give type
             *
             * @param {String} type The component identifier
             * @return {Array} An array containing of the requested type
             */
            getAllComponentsOfType: function (type) {
                var col = this.components[type];
                if (col) {
                    return col.toData();
                }
                return null;
            },

            /**
             * Returns all component values for a given entity
             *
             * @param {String} entityId The entity identifier (returned by "createEntity")
             * @return {Object} A map (component identifier -> component value) containing
             *      all components of the requested entity (The map will be empty if the
             *      entity does not exist)
             *
             */
            getAllComponentsOfEntity: function (entityId) {
                var result = {};
                var entity = this.entities.get(entityId);
                var componentTypes = entity && entity.components;

                alchemy.each(componentTypes, function (type) {
                    result[type] = this.getComponent(entityId, type);
                }, this);

                return result;
            },

            /**
             * Returns the component of a given type for the specified entity
             * specific entity of all of that type
             *
             * @param {String} entityId An entity id
             * @param {String} componentKey The component type
             * @return {Object} A single component
             */
            getComponent: function (entityId, componentKey) {
                var collection = this.components[componentKey];
                return collection && collection.get(entityId);
            },
        };
    });
};
