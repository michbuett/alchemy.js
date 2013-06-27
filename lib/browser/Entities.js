(function () {
    'use strict';

    var alchemy = require('./Alchemy.js');

    /**
     * The master entity manager
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
             */
            components: undefined,

            /**
             * The type definitions (which componentes has an entity, what
             * default values have these componenets, ...) for the various
             * entities
             *
             * @property entityTypes
             * @type {Object}
             */
            entityTypes: undefined,

            /** @protected */
            init: function () {
                this.components = {};
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

                var defaults = this.entityTypes[type] || {};
                var componentKeys = alchemy.union(Object.keys(defaults), Object.keys(cfg));

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
                }, this);

                return entityId;
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
