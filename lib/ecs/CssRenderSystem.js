module.exports = function (alchemy) {
    'use strict';

    /**
     * A component system to render static and dynamic CSS
     *
     * @class
     * @name alchemy.ecs.CssRenderSystem
     */
    alchemy.formula.add({
        name: 'alchemy.ecs.CssRenderSystem',
        requires: [
            'alchemy.web.Stylus'
        ],

    }, function (_super) {
        return {
            /** @lends alchemy.ecs.CssRenderSystem.prototype */

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
                this.stylus = alchemy('alchemy.web.Stylus').brew();

                _super.constructor.call(this, cfg);
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
                var cssConfigs = this.entities.getAllComponentsOfType('css');
                alchemy.each(cssConfigs, this.updateEntity, this);
            },

            /** @private */
            updateEntity: function (cfg, index, placeholder) {
                if (!cfg.renderer) {
                    return;
                }

                var state = this.entities.getComponent(cfg.id, 'state');
                if (!state || state.current === state.last) {
                    return;
                }

                var rules = cfg.renderer.call(null, state.current);
                this.setRules(rules);
            },

            /** @private */
            setRules: function (rules) {
                this.stylus.setRules(rules);
            },
        };
    });
};
