(function () {
    'use strict';

    var alchemy = require('./../Alchemy.js');

    /**
     * Description
     *
     * @class
     * @name alchemy.web.Applicatus
     * @extends alchemy.core.MateriaPrima
     */
    alchemy.formula.add({
        name: 'alchemy.web.Applicatus',
        extend: 'alchemy.core.MateriaPrima',

        requires: [
            'alchemy.core.Observari',
            'alchemy.core.Immutatio',
        ],

        overrides: {
            /** @lends alchemy.web.Applicatus.prototype */

            /**
             * <code>true</code> if the app is running
             *
             * @property runs
             * @type Boolean
             * @private
             */
            runs: false,

            /**
             * Initialize application instance; It is recommended to call the
             * super method when overriding alchemy.web.Applicatus.init
             * @protected
             */
            init: function () {
                this.messages = alchemy('Observari').brew();
            },

            /**
             * Override super type to stop update loop and dispose message bus
             * @protected
             */
            finish: function () {
                this.shutdown();

                if (this.messages) {
                    this.messages.dispose();
                    this.message = null;
                }

                if (this.state) {
                    this.state.dispose();
                    this.state = null;
                }
            },

            /**
             * Hook-method; called when launching the app
             */
            onLaunch: alchemy.emptyFn,

            /**
             * Hook-method; called before closing the app
             */
            onShutdown: alchemy.emptyFn,

            /**
             * Hook-method; called in each loop run to update the application state
             *
             * @param {Object} loopParams The parameter of the current loop iteration
             * @param {Number} loopParams.now The current timestamp
             * @param {Number} loopParams.frame The number of the current iteration
             * @param {Number} loopParams.fps The frames per second
             * @param {State} loopParams.state The current application state
             *
             * @return Object The new application state
             */
            update: alchemy.emptyFn,

            /**
             * Hook-method; called in each loop run to update the application view
             *
             * @param {Object} loopParams The parameter of the current loop iteration
             * @param {Number} loopParams.now The current timestamp
             * @param {Number} loopParams.frame The number of the current iteration
             * @param {Number} loopParams.fps The frames per second
             * @param {State} loopParams.state The current application state
             */
            draw: alchemy.emptyFn,

            /**
             * Starts the application loop;
             * This will call the {@link #onLaunch} hook method
             */
            launch: function () {
                if (this.runs) {
                    return;
                }

                this.runs = true;
                this.frame = 0;
                this.lastTick = alchemy.now();
                this.onLaunch();

                /**
                 * Fired after application is ready
                 * @event
                 * @name app:start
                 */
                this.messages.trigger('app:start');

                // start the update/draw-loop
                this.boundLoopFn = this.createLoopFunction(this);
                this.boundLoopFn();
            },

            /**
             * stops the application loop;
             * this will call the {@link #finish} method
             */
            shutdown: function () {
                if (!this.runs) {
                    return;
                }

                if (this.loopId) {
                    var cancelAnimationFrame = this.cancelAnimationFrame;

                    cancelAnimationFrame(this.loopId);

                    this.boundLoopFn = null;
                    this.loopId = null;
                }

                this.onShutdown();

                /**
                 * Fired after application is shut down
                 * @event
                 * @name app:stop
                 */
                this.messages.trigger('app:stop');
                this.runs = false;
            },

            /**
             * Returns <code>true</code> if and only if the current application
             * is running (it may or may not be paused though)
             *
             * @return {Boolean}
             */
            isRunning: function () {
                return this.runs;
            },

            //
            //
            // private helper
            //
            //

            requestAnimationFrame: window.requestAnimationFrame,
            cancelAnimationFrame: window.cancelAnimationFrame,

            /**
             * Creats the application loop method which called every iteration;
             * will call the {@link #update} and the {@link #draw} method
             * @function
             * @private
             */
            createLoopFunction: function (app) {
                // Use an instance of "LoopParameter" instead of a generic object
                // because most javascript interpreter have optimized property
                // access for objects with a "hidden class"
                function LoopParameter() {
                    this.frame = 0;
                    this.now = 0;
                    this.delay = 0;
                    this.fps = 0;
                    this.state = null;
                }

                var then = alchemy.now();
                var frame = 0;
                var loopParams = new LoopParameter();
                var fps = 60;
                var delay = 1000 / fps;
                var requestAnimationFrame = this.requestAnimationFrame;

                return function loop(now) {
                    now  = now || alchemy.now();
                    delay = 0.95 * delay + 0.05 * (now - then);
                    fps = 1000 / delay;
                    then = now;
                    frame++;

                    // update the parameter set for the current iteration
                    loopParams.frame = frame;
                    loopParams.now = now;
                    loopParams.delay = Math.round(delay);
                    loopParams.fps = Math.round(fps);
                    loopParams.state = app.state;

                    var newState = app.update(loopParams);
                    if (newState && newState !== app.state) {
                        app.state = newState;
                        loopParams.state = app.state;
                    }

                    app.draw(loopParams);

                    app.loopId = requestAnimationFrame(app.boundLoopFn);
                };
            },
        }
    });
}());
