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
             * Defines a new entity type
             *
             * @param {String} key The entity type identifier
             * @param {Object} descriptor The entity type descriptor
             */
            defineEntityType: function (key, descriptor) {
                this.repo.defineEntityType(key, descriptor);

                alchemy.each(this.systems, function (system) {
                    if (!alchemy.isFunction(system.defineEntityType)) {
                        return;
                    }

                    system.defineEntityType(key, descriptor);
                }, this);
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
                var repo = this.repo;

                alchemy.each(Object.keys(toBeRemoved), repo.removeEntity, repo);
                alchemy.each(toBeCreated, repo.createEntity, repo);

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
                cfg.children = alchemy.each(cfg.children, this.createEntity, this);
                return this.repo.createEntity(cfg);
            },
        };
    });
};

