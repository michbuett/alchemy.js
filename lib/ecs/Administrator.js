var immutable = require('immutabilis');

module.exports = function (alchemy) {
    'use strict';

    /**
     * Description
     *
     * @class
     * @name alchemy.ecs.Administrator
     */
    alchemy.formula.add({
        name: 'alchemy.ecs.Administrator',

    }, function (_super) {
        return {
            /** @lends alchemy.ecs.Administrator.prototype */

            /** @override */
            constructor: function (cfg) {
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

                _super.constructor.call(this, cfg);
            },

            /** @override */
            dispose: function () {
                alchemy.each(this.systems, function (system, index) {
                    this.systems[index].dispose();
                    this.systems[index] = null;
                }, this);

                this.systems = null;
                this.repo = null;
                this.entitiesFromState = null;
                this.lastState = null;
                this.defaults = null;

                _super.dispose.call(this);
            },

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
                alchemy.each(list, function (cfg) {
                    if (alchemy.isFunction(cfg)) {
                        this.entitiesFromState.push({
                            fn: cfg,
                        });
                        return;
                    }

                    this.createEntity(cfg);
                }, this);

                alchemy.each(this.entitiesFromState, this.updateDynamicEntities, this, [state]);

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
                    alchemy.each(this.entitiesFromState, this.updateDynamicEntities, this, args);
                }

                alchemy.each(this.systems, this.updateSystem, this, args);

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

                alchemy.each(Object.keys(toBeRemoved), this.removeEntity, this);
                alchemy.each(toBeCreated, this.createEntity, this);

                cfg.current = newList;
            },

            /** @private */
            createEntityMap: function (list) {
                var result = {};

                alchemy.each(list, function (cfg) {
                    result[cfg.id] = cfg;
                });

                return result;
            },

            /** @private */
            findItemsNotInList: function (list1, list2) {
                return alchemy.each(list1, function (item, key) {
                    if (!list2[key]) {
                        return item;
                    }
                });
            },

            /** @private */
            createEntity: function (cfg) {
                var defaults = this.defaults[cfg.type];
                if (defaults) {
                    cfg = defaults.set(cfg).val();
                }

                if (cfg.children) {
                    cfg.children = alchemy.each(cfg.children, this.createEntity, this);
                }

                return this.repo.createEntity(cfg);
            },

            /** @private */
            removeEntity: function (entity) {
                return this.repo.removeEntity(entity);
            }
        };
    });
};
