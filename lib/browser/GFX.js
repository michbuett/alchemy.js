(function () {
    'use strict';

    var alchemy = require('./../Alchemy.js');

    /**
     * A container to manage the sprites of a sprite sheet
     * @class
     * @name alchemy.browser.SpriteSheet
     */
    alchemy.formula.add({
        name: 'alchemy.browser.GFX',
        alias: 'GFX',
        overrides: {
            /** @lends alchemy.browser.GFX.prototype */

            cloneImage: function (source, target) {
                var targetContext = target.getContext('2d');
                targetContext.imageSmoothingEnabled = false;
                targetContext.msImageSmoothingEnabled = false;
                targetContext.webkitImageSmoothingEnabled = false;
                targetContext.mozImageSmoothingEnabled = false;
                targetContext.drawImage(this.sheet.sprites[sourceIndex], 0, 0);

                return target;
            }
        }
    });
}());
