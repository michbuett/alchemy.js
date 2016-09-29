module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');

    /**
     * A component system to render static and dynamic CSS
     *
     * @class
     * @name alchemy.lib.CssRenderSystem
     */
    return coquoVenenum({
        /** @lends alchemy.lib.CssRenderSystem.prototype */

        /**
         * The css style helper which does the heavy lifting
         *
         * @property stylus
         * @type alchemy.lib.Stylus
         * @private
         */
        stylus: undefined,

        /**
         * Updates the rendered CSS according to the current UI entites
         * @param {Map} entities
         */
        update: function (entities) {
            entities.forEach(this.updateDynamicCss, this);
        },

        /** @private */
        updateDynamicCss: function (entity, entityId) {
            var css = entity.css;
            if (!css || typeof css !== 'object') {
                return;
            }

            this.stylus.setRules(css);
        },
    });
}());
