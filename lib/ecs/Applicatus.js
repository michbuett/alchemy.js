module.exports = function (alchemy) {
    'use strict';

    /**
     * TODO: document me!
     *
     * @class
     * @name alchemy.ecs.Applicatus
     * @extends alchemy.web.Applicatus
     */
    alchemy.formula.add({
        name: 'alchemy.ecs.Applicatus',
        extend: 'alchemy.web.Applicatus',
        requires: [
            'alchemy.ecs.Apothecarius',
        ],

    }, function (_super) {
        return {
            /** @lends alchemy.ecs.Applicatus.prototype */

            /** @override */
            constructor: function (cfg) {
                /**
                 * The list of component systems
                 *
                 * @property systems
                 * @type Array
                 * @private
                 */
                this.systems = [];

                _super.constructor.call(this, cfg);
            },

            /** @override */
            dispose: function () {
                alchemy.each(this.systems, function (system, index) {
                    this.systems[index].dispose();
                    this.systems[index] = null;
                }, this);
                this.systems = null;

                _super.dispose.call(this);
            },

            /**
             * Adds a new component system. Any component system should implement
             * the methods "update" and "defineEntity"
             *
             * @param {Object} newSystem The new component system
             */
            addSystem: function (newSystem) {
                this.systems.push(newSystem);
            },

            /**
             * Defines a new entity type
             *
             * @param {String} key The entity type identifier
             * @param {Object} descriptor The entity type descriptor
             */
            defineEntityType: function (key, descriptor) {
                this.entities.defineEntityType(key, descriptor);

                alchemy.each(this.systems, function (system) {
                    if (!alchemy.isFunction(system.defineEntityType)) {
                        return;
                    }

                    system.defineEntityType(key, descriptor);
                }, this);
            },

            /** @protected */
            update: function (params) {
                alchemy.each(this.systems, this.updateSystem, this, [params]);
            },

            /** @private */
            updateSystem: function (system, index, params) {
                system.update(params.state);
            },
        };
    });
};
