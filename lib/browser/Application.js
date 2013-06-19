(function () {
    'use strict';

    var alchemy = require('./alchemy.js');

    /**
     * Description
     *
     * @class
     * @name alchemy.browser.Application
     * @extends alchemy.core.MateriaPrima
     */
    alchemy.formula.add({
        name: 'alchemy.browser.Application',
        extend: 'alchemy.core.MateriaPrima',
        overrides: {
            /** @lends alchemy.browser.Application.prototype */

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


            /**
             * The loop parameter object passed to the {@link #update} and {@link #draw}
             * methods. It provides the following properties:
             *  - now: the current timestamp
             *  - frame: the number of the current frame
             *
             * @property loopParams,
             * @type Object
             * @private
             */
            loopParams: undefined,

            init: function () {
                this.frames = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                this.boundLoopFn = this.loop.bind(this);
                this.loopParams = {};
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
             * Pauses the application
             * @return {Object} The current application instance for chaining
             */
            pause: function () {
                this.paused = true;
                return this;
            },

            /**
             * Unpauses the application
             * @return {Object} The current application instance for chaining
             */
            unpause: function () {
                this.paused = false;
                return this;
            },

            /**
             * The frames per second
             * @function
             *
             * @return {Number}
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
             * Returns <code>true</code> if and only if the current application
             * is running (it may or may not be paused though)
             *
             * @return {Boolean}
             */
            isRunning: function () {
                return this.runs;
            },

            /**
             * Returns <code>true</code> if the application is paused
             *
             * @return {Boolean}
             */
            isPaused: function () {
                return this.paused;
            },

            //
            //
            // private helper
            //
            //

            /**
             * A shim for window.requestAnimationFrame; It tells the browser that you
             * wish to perform an animation and requests that the browser call a specified
             * function to update an animation before the next repaint.
             * @function
             * @private
             *
             * @param {Function} callback A callback to be invoked before the repaint
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
                    var frame = this.frame++;
                    var currentTick = Date.now();
                    var diff = (currentTick - this.lastTick) || 1;

                    this.lastTick = currentTick;
                    this.frames.shift();
                    this.frames.push(1000 / diff);

                    this.reqAnimFrame(this.boundLoopFn);

                    if (!this.paused) {
                        this.loopParams.frame = frame;
                        this.loopParams.now = currentTick;

                        this.update(this.loopParams);
                        this.draw(this.loopParams);
                    }
                }
            },
        }
    });
}());

