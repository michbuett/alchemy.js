(function () {
    'use strict';

    var alchemy = require('./alchemy.js');

    /**
     * Description
     */
    alchemy.formula.add({
        name: 'alchemy.browser.AnimatedEl',
        extend: 'alchemy.browser.View',
        requires: ['alchemy.core.Collectum', 'alchemy.browser.Animatus'],

        overrides: {
            template: [
                '<canvas id="<$=data.id$>"',
                ' width="<$=data.width$>"',
                ' height="<$=data.height$>"',
                ' class="Ü-animatus <$=data.cls$>"',
                ' style="left: <$=data.x$>px; top: <$=data.y$>px;"',
                ' >',
                '</canvas>'
            ].join(''),

            animations: undefined,

            init: function hocuspocus(_super) {
                return function () {
                    var animations = this.animations;
                    this.animations = alchemy('Collectum').brew();

                    if (alchemy.isString(this.sheet)) {
                        this.sheet = this.resources.get(this.sheet);
                    }

                    alchemy.each(animations, function (animCfg, animKey) {
                        if (alchemy.isArray(animCfg)) {
                            animCfg = {
                                frames: animCfg
                            };
                        }
                        this.addAnimation(animKey, animCfg);
                    }, this);


                    if (this.idleAnimation) {
                        this.play(this.idleAnimation);
                    }

                    _super.call(this);
                };
            },

            addAnimation: function (key, cfg) {
                var anim = alchemy('Animatus').brew(alchemy.mix({
                    id: key,
                    x: 0,
                    y: 0,
                    sheet: this.sheet
                }, this.defaults, cfg));

                this.observe(anim, 'framechanged', this.redraw, this);

                this.animations.add(anim);
            },

            play: function (anim) {
                anim = anim || this.idleAnimation;
                if (this.animations.contains(anim)) {
                    this.currAnim = this.animations.get(anim);
                    this.currAnim.start();
                }
            },

            getCurrentAnimation: function () {
                return this.currAnim;
            },

            getContext: function () {
                if (!this.canvasCtxt) {
                    this.canvasCtxt = this.el && this.el.getContext('2d');
                }
                return this.canvasCtxt;
            },

            redraw: function () {
                var anim;
                var ctxt = this.getContext();

                if (ctxt) {
                    ctxt.clearRect(0, 0, this.width, this.height);

                    anim = this.getCurrentAnimation();
                    if (anim) {
                        anim.draw(ctxt);
                    }
                }
            },

            update: function (params) {
                var anim = this.getCurrentAnimation();
                if (anim) {
                    anim.update(params);
                }
            }
        }
    });
}());
