module.exports = (function () {
    'use strict';

    var immutable = require('immutabilis');
    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');
    var utils = require('../lib/Utils');

    /**
     * The primary entity manager (an apothecarius is a storage manager)
     * "One potion to rule them all, one potion to find them,
     * one potion to bring them all and in the darkness bind them"
     *
     * @class
     * @name alchemy.old.Apothecarius
     * @extends alchemy.old.MateriaPrima
     */
    return coquoVenenum({
        /** @lends alchemy.old.Apothecarius.prototype */

        /**
         * Creates a new entity (a set of components)
         *
         * @param {Object} cfg The entity type or a custom component
         *      configurations
         * @param {String} [cfg.id] Optional. An entity ID. If ommitted a new
         *      one will be created
         *
         * @return {String} The id of the new entity
         */
        createEntity: function (cfg) {
            var entityId = cfg.id || utils.id();
            if (this.contains(entityId)) {
                throw 'The id: "' + entityId + '" is already used';
            }

            this.entities[entityId] = {
                id: entityId,
                components: [],
            };

            // create the components of the new entity
            each(cfg, function (component, key) {
                if (key === 'id' || key === 'type') {
                    return;
                }

                this.setComponent(entityId, key, component);
            }, this);

            return entityId;
        },

        /**
         * Checks if an entity with the given id exists
         * @return Boolean
         */
        contains: function (entityId) {
            return utils.isObject(this.entities[entityId]);
        },

        /**
         * Completely removes all existing entities and their
         * components - The total clean-up - The end of days...
         */
        removeAllEntities: function () {
            each(Object.keys(this.entities), this.removeEntity, this);
        },

        /**
         * Removes an entity and all its components
         *
         * @param {String} entityId The id of entity to remove
         */
        removeEntity: function (entityId) {
            if (!this.contains(entityId)) {
                return;
            }

            var entity = this.entities[entityId];
            var cmps = entity.components;

            while (cmps.length > 0) {
                this.removeComponent(entity, cmps[0]);
            }

            this.entities[entityId] = null;
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
            var entity = utils.isObject(entityId) ? entityId : this.entities[entityId];
            if (!utils.isObject(entity)) {
                throw 'Unknown entity: "' + entityId + '"';
            }

            var index = entity.components.indexOf(type);
            if (index >= 0) {
                entity.components.splice(index, 1);
            }

            var collection = this.components[type];
            if (collection) {
                collection[entity.id] = null;
            }
        },

        /**
         * Returns an array containing all components of a give type
         *
         * @param {String} type The component identifier
         * @return {Object} An entityId-to-component hash map
         */
        getAllComponentsOfType: function (type) {
            return each(this.components[type], filterExisting);
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
            var entity = this.entities[entityId];
            var componentTypes = entity && entity.components;

            each(componentTypes, function (type) {
                result[type] = this.getComponentData(entityId, type);
            }, this);

            return result;
        },

        /**
         * Returns the immutable component of a given type for the specified
         * entity specific entity of all of that type
         *
         * @param {String} entityId An entity id
         * @param {String} componentKey The component type
         * @return {Immutatable} The immutable data of a single component
         */
        getComponent: function (entityId, componentKey) {
            var collection = this.components[componentKey];
            return collection && collection[entityId];
        },

        /**
         * Returns the raw component data of a given type for the specified
         * entity specific entity of all of that type
         *
         * @param {String} entityId An entity id
         * @param {String} componentKey The component type
         * @return {Object} The raw data for single component
         */
        getComponentData: function (entityId, componentKey) {
            var component = this.getComponent(entityId, componentKey);
            return component && component.val();
        },

        /**
         * Add a component to an entity
         *
         * @param {String} entityId The entity identifier
         * @param {String} key The component identifier
         * @param {Object} cfg The component configuration
         * @return {Object} The added component object
         */
        setComponent: function (entityId, key, cfg) {
            var entity = this.entities[entityId];
            if (!entity) {
                throw 'Unknown entity: "' + entityId + '"';
            }

            var collection = this.components[key];
            if (!collection) {
                // it's the first component of this type
                // -> create a new collection
                collection = {};
                this.components[key] = collection;
            }

            var cmp = collection[entityId];
            if (cmp) {
                // update existing component
                cmp = cmp.set(cfg);

            } else {
                // add new component
                cmp = immutable.fromJS(cfg);
                entity.components.push(key);
            }

            collection[entityId] = cmp;

            return cmp.val();
        },

    }).whenBrewed(function () {
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
         * The collection of registered entities; each entity is an object with
         * an <code>id</code> and an array of strings (<code>components</code>)
         * which refer the entity's components
         *
         * @property entities
         * @type {Object}
         * @private
         */
        this.entities = {};

    }).whenDisposed(function () {
        this.removeAllEntities();
    });


    /** @private */
    function filterExisting(obj) {
        if (obj) {
            return obj.val();
        }
    }
}());
