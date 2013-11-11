(function () {
    'use strict';

    var alchemy = require('./alchemy.js');

    /**
     * A container to manage the sprites of a sprite sheet
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
             * The initial sprite sheet source image
             * NOTICE: This is a mere configuration property and not available
             * after the sprite sheet instance is brewed; Use {@link #compose}
             * to get an image with the current sprites
             * @property image
             * @type {Image/Canvas}
             */
            image: undefined,

            /**
             * The total width the sprite sheet (read-only)
             * @property width
             * @type Number
             */
            width: 0,

            /**
             * The total height of the sprite sheet (read-only)
             * @property sprites
             * @type Number
             */
            height: 0,

            /**
             * The number of columns (sprites per row)
             * @property columns
             * @type Number
             */
            columns: 0,

            /**
             * The number of rows (sprites per column)
             * @property rows
             * @type Number
             */
            rows: 0,

            /**
             * The list of sprites of the sprite sheet (read-only)
             * @property sprites
             * @type Array
             * @private
             */
            sprites: undefined,

            /** @function */
            init: function () {
                if (this.image) {
                    this.extractSprites(this.image);
                    delete this.image;
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
                    spriteCtx,
                    clone, cloneCtx;

                this.columns = Math.max(1, Math.floor(image.width / sw));
                this.rows = Math.max(1, Math.floor(image.height / sh));
                this.width = this.columns * sw;
                this.height = this.rows * sh;
                this.sprites = [];

                // clone the source image to make sure that the source image has the
                // correct size (FF and IE will throw INDEX_SIZE_ERROR if the image
                // is too small, even if the width and height values are correctly)
                clone = document.createElement('canvas');
                clone.width = this.width;
                clone.height = this.height;
                cloneCtx = clone.getContext('2d');
                cloneCtx.drawImage(image, 0, 0);

                while (y + sh <= this.height) {
                    x = 0;
                    while (x + sw <= this.width) {
                        spriteCvs = document.createElement('canvas');
                        spriteCvs.width = sw;
                        spriteCvs.height = sh;
                        spriteCtx = spriteCvs.getContext('2d');
                        spriteCtx.drawImage(clone, x, y, sw, sh, 0, 0, sw, sh);
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
                columns = columns || this.columns;
                rows = rows || this.rows;

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
            },

            /**
             * Returns an ArrayBuffer representation of the composed sprite sheet
             * (adapted from: http://stackoverflow.com/questions/6431281/save-png-canvas-image-to-html5-storage-javascript)
             *
             * @param {Number} [columns] The number of columns in the resulting
             *      sheet; Defaults to original number (total width / sprite width)
             * @param {Number} [rows] The number of rows in the resulting sheet;
             *      Defaults to original number (total height / sprite height)
             * @param {String} [type] The mime-type defaults to "image/png"
             * @return {ArrayBuffer} The ArrayBuffer representation of the composed
             *      sprite sheet
             */
            toBuffer: function (columns, rows, type) {
                var dataURI = this.compose(columns, rows).toDataURL(type);

                // convert base64 to raw binary data held in a string
                // doesn't handle URLEncoded DataURIs
                var byteString = atob(dataURI.split(',')[1]);

                // write the bytes of the string to an ArrayBuffer
                var ab = new ArrayBuffer(byteString.length);
                var ia = new Uint8Array(ab);
                for (var i = 0, l = byteString.length; i < l; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }

                return ab;
            },

            /**
             * Returns a blob representation of the composed sprite sheet
             * (adapted from: http://stackoverflow.com/questions/6431281/save-png-canvas-image-to-html5-storage-javascript)
             *
             * @param {Number} [columns] The number of columns in the resulting
             *      sheet; Defaults to original number (total width / sprite width)
             * @param {Number} [rows] The number of rows in the resulting sheet;
             *      Defaults to original number (total height / sprite height)
             * @param {String} [type] The mime-type defaults to "image/png"
             * @return {ArrayBuffer} The blob representation of the composed
             *      sprite sheet
             */
            toBlob: function (columns, rows, type) {
                var ab = this.toBuffer(columns, rows, type);

                // write the ArrayBuffer to a blob, and you're done
                var blob = new Blob([ab], {
                    'type': type || 'image/png'
                });
                return blob;
            },
        }
    });
}());
