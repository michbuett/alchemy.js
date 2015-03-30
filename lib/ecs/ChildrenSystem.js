module.exports = function (alchemy) {
    'use strict';

    /**
     * TODO: document me
     * <pre><code>
     * ...
     * children: {
     *   current: <Immutable>
     *   last: <Immutable>
     *   fix: {
     *     key1: {
     *       // configuration for child entity #1
     *     },
     *     key2: {
     *       // configuration for child entity #2
     *     },
     *     ...
     *   },
     *   fromState: {
     *     strategy: <String> // strategy name
     *     defaults: {
     *        ... // the child entity default values
     *     },
     * },
     * ...
     * </code></pre>
     *
     * @class
     * @name alchemy.ecs.ChildrenSystem
     */
    alchemy.formula.add({
        name: 'alchemy.ecs.ChildrenSystem',

    }, function (_super) {
        return {
            /** @lends alchemy.ecs.ChildrenSystem.prototype */

            /**
             * The entity storage
             *
             * @property entities
             * @type alchemy.ecs.Apothecarius
             * @private
             */
            entities: undefined,

            constructor: function (cfg) {
                this.entities = null;
                this.strategies = {};

                _super.constructor.call(this, cfg);
            },

            addStrategy: function (key, strategy) {
                this.strategies[key] = strategy;
            },

            /**
             * Updates the component system with the current application state
             *
             * @param Immutable appState The current application state
             */
            update: function (appState) {
                var components = this.entities.getAllComponentsOfType('children');

                alchemy.each(components, this.updateEntity, this, [appState]);
            },

            /** @private */
            updateEntity: function (cmp, index, appState) {
                cmp.current = cmp.current || alchemy('Immutatio').makeImmutable([]);
                cmp.last = cmp.current;

                if (cmp.fix) {
                    cmp.current = this.createFix(cmp.id, cmp.fix, cmp.current);
                    cmp.fix = null;
                }

                if (cmp.fromState) {
                    cmp.current = this.createFromState(cmp.id, cmp.fromState, cmp.current);
                }
            },

            /** @private */
            createFix: function (entityId, fix, current) {
                var newChildren = alchemy.each(fix, this.createChild, this);
                return current.set(newChildren);
            },

            /** @private */
            createFromState: function (entityId, cfg, currentChildren) {
                var state = this.entities.getComponent(entityId, 'state');
                if (!state || state.current === state.last) {
                    return currentChildren;
                }

                var strategy = this.strategies[cfg.strategy];
                var entityConfigs = strategy(state.current.val(), cfg.defaults);
                var newChildren = alchemy.each(entityConfigs, this.createChild, this);
                var obsoletChildren = this.findObsoleteEntities(currentChildren.val(), newChildren);

                if (obsoletChildren.length > 0) {
                    alchemy.each(obsoletChildren, this.entities.removeEntity, this.entities);
                    return alchemy('Immutatio').makeImmutable(newChildren);
                }

                return currentChildren.set(newChildren);
            },

            /** @private */
            createChild: function (cfg) {
                if (cfg.id && this.entities.contains(cfg.id)) {
                    return cfg.id;
                }
                return this.entities.createEntity(cfg);
            },

            /** @private */
            findObsoleteEntities: function (currentChildren, newChildren) {
                var result = [];
                currentChildren = alchemy.values(currentChildren);
                newChildren = alchemy.values(newChildren);

                for (var i = 0, l = currentChildren.length; i < l; i++) {
                    var entityId = currentChildren[i];
                    if (newChildren.indexOf(entityId) < 0) {
                        result.push(entityId);
                    }
                }

                return result;
            },
        };
    });
};
