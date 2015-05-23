module.exports = function (alchemy) {
    'use strict';

    /**
     * A component system to render static and dynamic CSS
     *
     * @class
     * @name alchemy.ecs.CssRenderSystem
     * @extends alchemy.core.MateriaPrima
     */
    alchemy.formula.define('alchemy.ecs.CssRenderSystem', [
        'alchemy.core.MateriaPrima',
        'alchemy.web.Stylus',

    ], function (MateriaPrima, Stylus) {

        return alchemy.extend(MateriaPrima, {
            /** @lends alchemy.ecs.CssRenderSystem.prototype */

            /** @override */
            constructor: function (cfg) {
                /**
                 * The entity storage
                 *
                 * @property entities
                 * @type alchemy.ecs.Apothecarius
                 * @private
                 */
                this.entities = undefined;

                /**
                 * The css style helper which does the heavy lifting
                 *
                 * @property stylus
                 * @type alchemy.web.Stylus
                 * @private
                 */
                this.stylus = Stylus.brew();

                /**
                 * The the previous state
                 *
                 * @property lastStates
                 * @type Object
                 * @private
                 */
                this.lastStates = {};

                MateriaPrima.constructor.call(this, cfg);
            },

            /** @override */
            dispose: function () {
                this.stylus.dispose();
                this.stylus = null;
                this.entities = null;
                this.lastStates = null;

                MateriaPrima.dispose.call(this);
            },

            /**
             * Hook method to add event handler when defining new entities
             *
             * @param {String} key the entity type identifier
             * @param {Object} entityDescriptor the entity descriptor which should
             *      implement a <code>getEventHandler</code> method if it wants
             *      to add new event handler
             */
            defineEntityType: function (key, entityDescriptor) {
                if (!alchemy.isFunction(entityDescriptor.getStaticCss)) {
                    return;
                }

                this.setRules(entityDescriptor.getStaticCss());
            },

            /**
             * Updates the component system with the current application state
             */
            update: function () {
                var dynamicCss = this.entities.getAllComponentsOfType('css');
                alchemy.each(dynamicCss, this.updateDynamicCss, this);
            },

            /** @private */
            updateDynamicCss: function (cfg, entityId) {
                this.processTypeRules(cfg, entityId);
                this.processEntityRules(cfg, entityId);
            },

            /** @private */
            processTypeRules: function (cfg, entityId) {
                if (!cfg.typeRules) {
                    return;
                }

                this.setRules(cfg.typeRules);
                this.entities.setComponent(entityId, 'css', {
                    typeRules: null,
                });
            },

            /** @private */
            processEntityRules: function (cfg, entityId) {
                if (!cfg.entityRules) {
                    this.entities.removeComponent(entityId, 'css');
                    return;
                }

                var lastState = this.lastStates[entityId];
                var currentState = this.entities.getComponent(entityId, 'state');

                if (!currentState || currentState === lastState) {
                    return;
                }

                var rules = {};
                rules['#' + entityId] = cfg.entityRules.call(null, currentState);

                this.lastStates[entityId] = currentState;
                this.setRules(rules);
            },

            /** @private */
            setRules: function (rules) {
                this.stylus.setRules(rules);
            },
        });
    });
};
