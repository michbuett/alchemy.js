module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');
    var utils = require('./Alchemy');

    /**
     * A component system to render static and dynamic CSS
     *
     * @class
     * @name alchemy.ecs.CssRenderSystem
     * @extends alchemy.core.MateriaPrima
     */
    return coquoVenenum({
        /** @lends alchemy.ecs.CssRenderSystem.prototype */

        /**
         * The entity storage
         *
         * @property entities
         * @type alchemy.ecs.Apothecarius
         * @private
         */
        entities: undefined,

        /**
         * The css style helper which does the heavy lifting
         *
         * @property stylus
         * @type alchemy.web.Stylus
         * @private
         */
        stylus: undefined,

        /**
         * The the previous state
         *
         * @property lastStates
         * @type Object
         * @private
         */
        lastStates: undefined,

        /**
         * Updates the component system with the current application state
         */
        update: function () {
            var dynamicCss = this.entities.getAllComponentsOfType('css');
            each(dynamicCss, this.updateDynamicCss, this);
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
            if (!utils.isObject(cfg.entityRules)) {
                this.entities.removeComponent(entityId, 'css');
                return;
            }

            var rules = {};

            if (utils.isFunction(cfg.entityRules)) {
                var lastState = this.lastStates[entityId];
                var currentState = this.entities.getComponent(entityId, 'state');

                if (currentState === lastState) {
                    return;
                }

                rules['#' + entityId] = cfg.entityRules.call(null, currentState);

                this.lastStates[entityId] = currentState;
                this.setRules(rules);

                return;
            }

            rules['#' + entityId] = cfg.entityRules;

            this.setRules(rules);
            this.entities.removeComponent(entityId, 'css');
        },

        /** @private */
        setRules: function (rules) {
            this.stylus.setRules(rules);
        },

    }).whenBrewed(function () {
        this.lastStates = {};
    });
}());
