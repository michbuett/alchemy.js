(function () {
    'use strict';

    var alchemy = require('./alchemy.js');

    /**
     * Graphic effects for canvas images
     *
     * @class
     * @name alchemy.browser.GFX
     * @alias GFX
     */
    alchemy.formula.add({
        name: 'alchemy.browser.GFX',
        alias: 'GFX',
        overrides: {
            /** @lends alchemy.browser.GFX.prototype */

            setImageSmoothing: function (renderContext, value) {
                value = alchemy.isBoolean(value) ? value : false;

                if (alchemy.isObject(renderContext)) {
                    renderContext.webkitImageSmoothingEnabled = false;
                    renderContext.mozImageSmoothingEnabled = false;
                    renderContext.msImageSmoothingEnabled = false;
                    renderContext.imageSmoothingEnabled = false;
                }
                return this;
            },

            cloneImage: function (source, target) {
                if (!target) {
                    target = document.createElement('canvas');
                    target.width = source.width;
                    target.height = source.height;
                }

                var targetContext = target.getContext('2d');
                this.setImageSmoothing(targetContext, false);
                targetContext.drawImage(source, 0, 0);

                return target;
            }
        }
    });
}());
