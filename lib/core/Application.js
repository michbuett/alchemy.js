/*
 * Copyright (C) 2012 Michael Büttner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * The Software shall not be used for discriminating or manipulating people.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function () {
    'use strict';

    var alchemy = require('./alchemy.js');

    /**
     * Description
     *
     * @class core.Application
     * @extends MateriaPrima
     */
    alchemy.addFormula({
        name: 'core.Application',
        extend: 'MateriaPrima',
        overrides: {
            /**
             * <code>true</code> if the app has been stopped (not running)
             *
             * @property stopped
             * @type Boolean
             * @private
             */
            stopped: true,

            /**
             * <code>true</code if the app has been paused
             *
             * @property paused
             * @type Boolean
             * @private
             */
            paused: false,

            /**
             * The frames per second
             *
             * @property fps
             * @type util.MeanValue
             */
            fps: undefined,

            init: function () {
                this.fps = alchemy('util.MeanValue').create(20);
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
            start: function () {
                if (this.stopped) {
                    this.stopped = false;
                    this.frame = 0;
                    this.prepare();
                    this.lastTick = Date.now();

                    alchemy.reqAnimFrame(this.boundLoopFn);
                }
            },

            /**
             * stops the application loop;
             * this will call the {@link #finish} method
             */
            end: function () {
                if (!this.stopped) {
                    this.finish();
                    this.stopped = true;
                }
            },

            /**
             * the loop method; called every iteration;
             * will call the {@link #update} and the {@link #draw} method
             * @private
             */
            loop: function () {
                if (!this.stopped) {
                    var currentTick = Date.now();
                    var diff = (currentTick - this.lastTick) || 1;

                    this.lastTick = currentTick;
                    this.fps.add(1000 / diff);

                    alchemy.reqAnimFrame(this.boundLoopFn);
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
                return !this.stopped;
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

