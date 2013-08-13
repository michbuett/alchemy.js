(function () {
    'use strict';

    var alchemy = require('./alchemy.js');

    /**
     * Description
     */
    alchemy.formula.add({
        name: 'alchemy.browser.Animatus',
        alias: 'Animatus',
        extend: 'alchemy.core.Oculus',
        overrides: {

            /**
             * the animation frames; each frame oject provides the following properties:
             * <pre><code>
             * {
             *     image: {CanvasElement}, // the actual frame image
             *     durration: {Number}
             * }
             * </code></pre>
             *
             * @property frames
             * @type Array
             * @private
             */
            frames: undefined,

            /**
             * @property currentFrame
             * @type Number
             * @private
             */
            currentFrame: undefined,

            /**
             * @property currentIteration
             * @type Number
             * @private
             */
            currentIteration: undefined,

            /**
             * @property iterations
             * @type Number
             */
            iterations: -1,

            init: function hocuspocus(_super) {
                return function () {
                    _super.call(this);

                    var framesCfg = this.frames;
                    this.frames = [];

                    if (framesCfg && this.sheet) {
                        for (var i = 0; i < framesCfg.length; i++) {
                            var fCfg = framesCfg[i];
                            if (alchemy.isNumber(fCfg)) {
                                fCfg = {
                                    index: fCfg
                                };
                            }
                            if (this.defaults) {
                                alchemy.mix(fCfg, this.defaults, {
                                    override: false
                                });
                            }
                            this.frames[i] = alchemy.mix(fCfg, {
                                image: this.sheet.getSprite(fCfg.index)
                            });
                        }
                    }
                };
            },

            start: function () {
                this.currentIteration = 0;
                this.setCurrentFrame(0);
            },

            stop: function () {
                this.currentIteration = null;
            },

            isPlaying: function () {
                return alchemy.isNumber(this.currentIteration);
            },

            nextFrame: function () {
                if (this.currentFrame < this.frames.length - 1) {
                    this.setCurrentFrame(this.currentFrame + 1);
                } else if (this.iterations < 0 || this.currentIteration < this.iterations) {
                    this.setCurrentFrame(0);
                    this.currentIteration++;
                } else {
                    this.trigger('animationfinihed', this);
                }
            },

            setCurrentFrame: function (frameIdx) {
                this.currentFrame = frameIdx;
                this.image = this.frames[this.currentFrame].image;
                this.frameStartTime = Date.now();
                this.trigger('framechanged', this);
            },

            draw: function (ctxt) {
                if (this.image) {
                    ctxt.drawImage(this.image, 0, 0);
                }
                return ctxt;
            },

            update: function (params) {
                if (this.isPlaying()) {
                    var cFrame = this.frames[this.currentFrame];
                    if (params.now - this.frameStartTime > cFrame.durration) {
                        this.nextFrame();
                    }
                }
            }
        }
    });
}());