(function () {
    'use strict';

    var alchemy = require('./alchemy.js');

    /**
     * A container to manage the sprites of a spritesheet
     * @class
     * @name alchemy.browser.SpriteSheet
     */
    alchemy.formula.add({
        name: 'alchemy.browser.SpriteSheet',
        alias: 'SpriteSheet',
        overrides: {
            /** @lends alchemy.browser.SpriteSheet.prototype */

            /**
             * The width of a single sprite
             * @property spriteWidth
             * @type {Number}
             */
            spriteWidth: 0,

            /**
             * The height of a single sprite
             * @property spriteHeight
             * @type {Number}
             */
            spriteHeight: 0,

            /**
             * the initial sprite sheet image
             * @property image
             * @type {Image/Canvas}
             */
            image: undefined,

            /**
             * The total width the spritesheet
             * @property width
             * @type Number
             */
            width: 0,

            /**
             * The total height of the spritesheet
             * @property sprites
             * @type Number
             */
            height: 0,

            /**
             * The list of sprites of the spritesheet
             * @property sprites
             * @type Array
             * @private
             */
            sprites: undefined,

            /** @function */
            init: function () {
                if (this.image) {
                    this.extractSprites(this.image);
                }
            },

            /**
             * Splits the initial sheet image and extracts the sprites
             * @private
             */
            extractSprites: function (image) {
                var x = 0,
                    y = 0,
                    sw = this.spriteWidth,
                    sh = this.spriteHeight,
                    spriteCvs,
                    spriteCtx;

                this.width = image.width;
                this.height = image.height;
                this.sprites = [];

                while (y + sh <= this.height) {
                    x = 0;
                    while (x + sw <= this.width) {
                        spriteCvs = document.createElement('canvas');
                        spriteCvs.width = sw;
                        spriteCvs.height = sh;
                        spriteCtx = spriteCvs.getContext('2d');
                        spriteCtx.drawImage(image, x, y, sw, sh, 0, 0, sw, sh);
                        this.sprites.push(spriteCvs);
                        x += sw;
                    }
                    y += sh;
                }
            },

            /**
             * Returns the sprite to the given index
             *
             * @param {Number} index The index of the sprite to get
             * @return {Canvas}
             */
            getSprite: function (index) {
                return this.sprites && this.sprites[index];
            },

            /**
             * Creates a new canvas containing all the sprites
             *
             * @param {Number} [columns] The number of columns in the resulting
             *      sheet; Defaults to original number (total width / sprite width)
             * @param {Number} [rows] The number of rows in the resulting sheet;
             *      Defaults to original number (total height / sprite height)
             * @return {Canvas} The composed sprite sheet
             */
            compose: function (columns, rows) {
                columns = columns || Math.ceil(this.width / this.spriteWidth);
                rows = rows || Math.ceil(this.height / this.spriteHeight);

                var x = 0;
                var y = 0;
                var sw = this.spriteWidth;
                var sh = this.spriteHeight;
                var sheet = document.createElement('canvas');
                var ctxt = sheet.getContext('2d');
                var index = 0;
                var numSprites = this.sprites.length;

                sheet.width = columns * this.spriteWidth;
                sheet.height = rows * this.spriteHeight;

                for (var j = 0; j < rows && index < numSprites; j++) {
                    y = j * this.spriteHeight;
                    for (var i = 0; i < columns && index < numSprites; i++) {
                        x = i * this.spriteWidth;
                        ctxt.drawImage(this.getSprite(index), x, y, sw, sh);
                        index++;
                    }
                }

                return sheet;
            }
        }
    });
}());