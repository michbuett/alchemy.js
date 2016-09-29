module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');
    var utils = require('../lib/Utils');

    /**
     * A component system to render static and dynamic CSS
     *
     * @class
     * @name alchemy.old.CssRenderSystem
     * @extends alchemy.old.MateriaPrima
     */
    return coquoVenenum({
        /** @lends alchemy.old.CssRenderSystem.prototype */

        /**
         * The entity storage
         *
         * @property entities
         * @type alchemy.old.Apothecarius
         * @private
         */
        entities: undefined,

        /**
         * The css style helper which does the heavy lifting
         *
         * @property stylus
         * @type alchemy.old.Stylus
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
         * The previous application state
         *
         * @property appState
         * @type Immutablis
         * @private
         */
        lastAppState: undefined,

        /**
         * Updates the component system with the current application state
         * @param Immutablis state The current application state
         */
        update: function (state) {
            if (state === this.lastAppState) {
                return;
            }

            var dynamicCss = this.entities.getAllComponentsOfType('css');
            each(dynamicCss, this.updateDynamicCss, this, [state]);

            this.lastAppState = state;
        },

        /** @private */
        updateDynamicCss: function (cfg, entityId, appState) {
            this.processTypeRules(cfg, entityId);
            this.processEntityRules(cfg, entityId, appState);
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
        processEntityRules: function (cfg, entityId, appState) {
            if (!utils.isObject(cfg.entityRules)) {
                this.entities.removeComponent(entityId, 'css');
                return;
            }

            var rules = {};

            if (utils.isFunction(cfg.entityRules)) {
                var lastState = this.lastStates[entityId];
                var currentState = this.mapState(cfg.stateMap, appState);

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
        mapState: function (stateMap, appState) {
            if (stateMap && typeof stateMap === 'function') {
                return stateMap(appState);
            }

            return appState;
        },

        /** @private */
        setRules: function (rules) {
            this.stylus.setRules(rules);
        },

    }).whenBrewed(function () {
        this.lastStates = {};
    });
}());
