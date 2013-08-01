(function () {
    'use strict';

    var alchemy = require('./Alchemy.js');

    /**
     * The primary entity manager potion
     * "One potion to rule them all, one potion to find them,
     * one potion to bring them all and in the darkness bind them"
     *
     * @class
     * @name alchemy.browser.Entities
     * @alias Entities
     * @extends core.alchemy.Oculus
     */
    alchemy.formula.add({
        name: 'alchemy.browser.Entities',
        alias: 'Entities',
        extend: 'alchemy.core.Oculus',
        overrides: {
            /** @lends arena.Entities.prototype */

            /**
             * The sets of different components (map component
             * type name -> collection of component instance)
             *
             * @property components
             * @type {Object}
             * @private
             */
            components: undefined,

            /**
             * The collection of registered entities; eah entity is an object with
             * an <code>id</code> and an array of strings (<code>components</code>)
             * which refer the entity's components
             *
             * @property entities
             * @type {alchemy.core.Collectum}
             * @private
             */
            entities: undefined,

            /**
             * The type definitions (which componentes has an entity, what
             * default values have these componenets, ...) for the various
             * entities
             *
             * @property entityTypes
             * @type {Object}
             * @private
             */
            entityTypes: undefined,

            /** @protected */
            init: function () {
                this.components = {};
                this.entities = alchemy('Collectum').brew();
            },

            /**
             * Initializes the component prototypes (defaults values)
             */
            initEntityTypes: function (types) {
                this.entityTypes = types;
            },

            /**
             * Creates a new entity (a set of components) for a given type
             *
             * @param {String} type The entity type
             * @param {Object} [cfg] Optional. Custom component configurations
             * @return {String} The id of the new entity
             */
            createEntity: function (type, cfg) {
                cfg = cfg || {};
                var entityId = cfg.id || alchemy.id();
                delete cfg.id;

                if (this.entities.contains(entityId)) {
                    return entityId;
                }

                var defaults = this.entityTypes[type] || {};
                var componentKeys = alchemy.union(Object.keys(defaults), Object.keys(cfg));
                var entity = {
                    id: entityId,
                    type: type,
                    components: [],
                };

                // create the components of the new entity
                alchemy.each(componentKeys, function (key) {
                    var collection = this.components[key];
                    if (!collection) {
                        // it's the first component of this type
                        // -> create a new collection
                        collection = alchemy('Collectum').brew();
                        this.components[key] = collection;
                    }

                    var cmpDefaults = defaults[key];
                    var cmp = alchemy.mix({
                        id: entityId, // use the entity id to reference each component
                        entities: this,
                        messages: this.messages,
                        resources: this.resources
                    }, cmpDefaults, cfg[key]);

                    if (cmp.potion) {
                        // the component is represented by a potion instead of raw
                        // data -> brew the potion using the current values as config
                        var potion = alchemy(cmp.potion);
                        delete cmp.potion;
                        cmp = potion.brew(cmp);
                    }
                    // store the component
                    collection.add(cmp);
                    entity.components.push(key);
                }, this);

                this.entities.add(entity);
                return entityId;
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
            removeEntity: function (entity) {
                entity = alchemy.isObject(entity) ? entity : this.entities.get(entity);
                if (!alchemy.isObject(entity)) {
                    // there is no such entity
                    return;
                }

                var cmps = entity.components;
                while (cmps.length > 0) {
                    this.removeComponent(entity, 0);
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
            removeComponent: function (entity, type) {
                var index, collection;

                entity = alchemy.isObject(entity) ? entity : this.entities.get(entity);
                if (!alchemy.isObject(entity)) {
                    return;
                }

                if (alchemy.isString(type)) {
                    index = entity.components.indexOf(type);
                } else if (alchemy.isNumber(type)) {
                    index = type;
                    type = entity.components[index];
                }

                if (index >= 0) {
                    entity.components.splice(index, 1);
                }

                collection = this.components[type];
                if (collection) {
                    var component = collection.get(entity.id);
                    collection.remove(entity);

                    if (alchemy.isFunction(component.dispose)) {
                        component.dispose();
                    }
                }
            },

            /**
             * Returns the component(s) of a given type - either one for a
             * specific entity of all of that type
             *
             * @param {String} componentKey The component type
             * @param {String} [entityId] An entity id
             * @return {Object|Collectum} A single component if an entity is
             *      given or the collection with all components of that type
             */
            getComponent: function (componentKey, entityId) {
                var collection;
                collection = this.components[componentKey];
                if (entityId) {
                    return collection && collection.get(entityId);
                } else {
                    return collection;
                }
            }
        }
    });
}());
