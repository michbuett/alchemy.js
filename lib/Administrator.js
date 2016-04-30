module.exports = (function () {
    'use strict';

    var immutable = require('immutabilis');
    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');

    /**
     * Description
     *
     * @class
     * @name alchemy.ecs.Administrator
     */
    return coquoVenenum({
        /** @lends alchemy.ecs.Administrator.prototype */

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
            each(list, function (cfg) {
                this.createEntity(cfg, null, state);
            }, this);

            each(this.entitiesFromState, this.updateDynamicEntities, this, [state]);

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
        updateDynamicEntities: function (cfg, index, state) {
            var currentList = cfg.current || [];
            var newList = this.createEntityMap(cfg.fn(state));
            var toBeRemoved = this.findItemsNotInList(currentList, newList);
            var toBeCreated = this.findItemsNotInList(newList, currentList);

            each(Object.keys(toBeRemoved), this.removeEntity, this);
            each(toBeCreated, this.createEntity, this, [state]);

            this.repo.setComponent(cfg.entityId, 'children', newList);

            cfg.current = newList;
        },

        /** @private */
        createEntityMap: function (list) {
            var result = {};

            each(list, function (cfg) {
                result[cfg.id] = cfg;
            });

            return result;
        },

        /** @private */
        findItemsNotInList: function (list1, list2) {
            return each(list1, function (item, key) {
                if (!list2[key]) {
                    return item;
                }
            });
        },

        /** @private */
        createEntity: function (cfg, key, state) {
            var defaults = this.defaults[cfg.type];
            if (defaults) {
                cfg = defaults.set(cfg).val();
            }

            var children = cfg.children;
            if (children) {
                cfg.children = each(children, this.createEntity, this, [state]);
            }

            var entityId = this.repo.createEntity(cfg);

            if (typeof children === 'function') {
                this.entitiesFromState.push({
                    entityId: entityId,
                    fn: children,
                });

                this.repo.setComponent(entityId, 'children', children(state));
            }

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
         * @type alchemy.ecs.Apothecarius
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

    }).whenDisposed(function () {
        each(this.systems, function (system, index) {
            this.systems[index].entities = null;
            this.systems[index].dispose();
            this.systems[index] = null;
        }, this);
    });
}());
