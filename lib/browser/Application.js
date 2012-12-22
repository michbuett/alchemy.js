(function () {
    'use strict';

    var alchemy = require('./alchemy.js');

    /**
     * Description
     *
     * @class browser.Application
     * @extends MateriaPrima
     */
    alchemy.formula.add({
        name: 'browser.Application',
        extend: 'MateriaPrima',
        overrides: {
            /**
             * <code>true</code> if the app is running
             *
             * @property runs
             * @type Boolean
             * @private
             */
            runs: false,

            /**
             * <code>true</code if the app has been paused
             *
             * @property paused
             * @type Boolean
             * @private
             */
            paused: false,


            init: function () {
                this.frames = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                this.boundLoopFn = this.loop.bind(this);
            },

            prepare: alchemy.emptyFn,

            update: alchemy.emptyFn,

            draw: alchemy.emptyFn,

            finish: alchemy.emptyFn,

            /**
             * starts the application loop;
             * this will call the {@link #prepare} method
             */
            launch: function () {
                if (!this.runs) {
                    this.runs = true;

                    if (this.title) {
                        document.title = this.title;
                    }

                    this.frame = 0;
                    this.prepare();
                    this.lastTick = Date.now();
                    this.reqAnimFrame(this.boundLoopFn);
                }
            },

            /**
             * stops the application loop;
             * this will call the {@link #finish} method
             */
            end: function () {
                if (this.runs) {
                    this.finish();
                    this.runs = false;
                }
            },

            /**
             * @param {Function} callback
             */
            reqAnimFrame: (function () {
                return window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function (callback) {
                        window.setTimeout(callback, 16.666);
                    };
            }()).bind(window),


            /**
             * the loop method; called every iteration;
             * will call the {@link #update} and the {@link #draw} method
             * @private
             */
            loop: function () {
                if (this.runs) {
                    var currentTick = Date.now();
                    var diff = (currentTick - this.lastTick) || 1;

                    this.lastTick = currentTick;
                    this.frames.shift();
                    this.frames.push(1000 / diff);

                    this.reqAnimFrame(this.boundLoopFn);
                    if (!this.paused) {
                        this.update(this.frame);
                        this.draw(this.frame);
                        this.frame++;
                    }
                }
            },

            /**
             * returns <code>true</code> if and only if the current application
             * is running (it may or may not be paused though)
             *
             * @return Boolean
             */
            isRunning: function () {
                return this.runs;
            },

            /**
             * pauses the application
             */
            pause: function () {
                this.paused = true;
            },

            /**
             * unpauses the application
             */
            unpause: function () {
                this.paused = false;
            },

            /**
             * The frames per second
             *
             * @return Number
             */
            fps: (function () {
                function sum(a, b) {
                    return a + b;
                }
                return function () {
                    return this.frames.reduce(sum) / this.frames.length;
                };
            }()),

            /**
             * returns <code>true</code> if the application is paused
             *
             * @return {Boolean}
             */
            isPaused: function () {
                return this.paused;
            }
        }
    });
}());

