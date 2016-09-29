module.exports = (function () {
    'use strict';

    var immutable = require('immutabilis');
    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');

    /** @private */
    function createIdSet(list) {
        var result = {};

        each(list, function (item) {
            if (item && typeof item === 'object') {
                result[item.id] = true;
            } else {
                result[item] = true;
            }
        });

        return result;
    }

    /** @private */
    function createId(key, parentEntityId) {
        return parentEntityId === undefined || parentEntityId === null ? key : parentEntityId + '-' + key;
    }

    /**
     * Description
     *
     * @class
     * @name alchemy.old.Administrator
     */
    return coquoVenenum({
        /** @lends alchemy.old.Administrator.prototype */

        /**
         * Adds a new component system. Any component system should implement
         * the method "update"
         *
         * @param {Object} newSystem The new component system
         */
        addSystem: function (newSystem) {
            newSystem.entities = this.repo;
            this.systems.push(newSystem);
        },

        addSystemNG: function (newSystem) {
            this.systemsNG.push(newSystem);
        },

        /**
         * Sets and overrides the defaults components for a given entity
         * tyle
         *
         * @param {String} key The entity type identifier
         * @param {Object} components The default components for the
         *      entity type
         */
        setEntityDefaults: function (key, components) {
            this.defaults[key] = immutable.fromJS(components);
        },

        /**
         * Initializes the appliction entities
         *
         * @param {Array} list A list of entity configurations or functions
         *      which will create entity configurations based on the current
         *      appliction state
         *
         * @param {Immutatable} state The initial application state
         */
        initEntities: function (list, state) {
            each(list, this.createEntity, this, [state]);

            this.lastState = state;
        },

        /**
         * Updates all registered systems and existing entities with the current
         * application state
         *
         * @param {Immutatable} state The current application state
         */
        update: function (state) {
            var args = [state];

            if (state !== this.lastState) {
                each(this.entitiesFromState, this.updateDynamicEntities, this, args);
            }

            each(this.systems, this.updateSystem, this, args);
            each(this.systemsNG, this.updateSystemNG, this, args);

            this.lastState = state;
        },

        //
        //
        // private helper
        //
        //

        /** @private */
        updateSystem: function (system, index, state) {
            system.update(state);
        },

        /** @private */
        updateSystemNG: function (system, index, state) {
            system.update(this.entities, state);
        },

        /** @private */
        updateDynamicEntities: function (cfg, index, state) {
            var currentList = this.repo.getComponentData(cfg.entityId, 'children');
            var currentEntities = createIdSet(currentList);

            var newList = cfg.fn(state);
            var newEntities = createIdSet(newList);

            each(currentList, function (existingEntityId) {
                if (newEntities[existingEntityId]) {
                    return;
                }

                this.removeEntity(existingEntityId);
            }, this);

            var newEntityIds = each(newList, function (newEntity, key) {
                if (currentEntities[newEntity.id]) {
                    return newEntity.id;
                }

                return this.createEntity(newEntity, key, state, cfg.entityId);
            }, this);

            this.repo.setComponent(cfg.entityId, 'children', newEntityIds);
        },

        /** @private */
        createEntity: function (cfg, key, state, parentEntityId) {
            var defaults = this.defaults[cfg.type];
            if (defaults) {
                cfg = defaults.set(cfg).val();
            }

            var entityId = cfg.id || createId(key, parentEntityId);
            var children = cfg.children;

            if (children) {
                if (typeof children === 'function') {
                    this.entitiesFromState.push({
                        entityId: entityId,
                        fn: children,
                    });

                    children = each(children(state), this.createEntity, this, [state, entityId]);
                } else {
                    children = each(children, this.createEntity, this, [state, entityId]);
                }
            }

            cfg.id = entityId;
            cfg.parent = parentEntityId;
            cfg.children = children;

            this.repo.createEntity(cfg);

            this.entities[entityId] = cfg;

            return entityId;
        },

        /** @private */
        removeEntity: function (entity) {
            return this.repo.removeEntity(entity);
        }

    }).whenBrewed(function () {
        /**
         * The entity repository
         *
         * @property repo
         * @type alchemy.old.Apothecarius
         * @private
         */
        this.repo = null;

        /**
         * The list of component systems
         *
         * @property systems
         * @type Array
         * @private
         */
        this.systems = [];
        this.systemsNG = [];

        /**
         * A list of functions which defines a set of entities depending
         * on the current application state
         *
         * @property entitiesFromState
         * @type Array
         * @private
         */
        this.entitiesFromState = [];

        /**
         * The last application state
         *
         * @property lastState
         * @type Immutatable
         * @private
         */
        this.lastState = null;

        /**
         * The set of component defaults (map entityType -> default values)
         *
         * @property defaults
         * @type Object
         * @private
         */
        this.defaults = {};

        this.entities = {};

    }).whenDisposed(function () {
        each(this.systems, function (system, index) {
            this.systems[index].entities = null;
            this.systems[index].dispose();
            this.systems[index] = null;
        }, this);
    });
}());
