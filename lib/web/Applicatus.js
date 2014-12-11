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

        requires: [
            'alchemy.core.Observari',
            'alchemy.core.Immutatio',
        ],

        overrides: function (_super) {
            return {
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
                 * The global message bus
                 *
                 * @property messages
                 * @type alchemy.core.Observari
                 * @protected
                 */
                messages: undefined,

                /**
                 * The application state
                 *
                 * @property state
                 * @type alchemy.core.Immutatio
                 * @protected
                 */
                state: undefined,

                /** @protected */
                constructor: function (cfg) {
                    _super.constructor.call(this, cfg);

                    this.messages = this.messages || alchemy('Observari').brew();
                    this.state = this.state || alchemy('Immutatio').brew();
                },

                /** @protected */
                dispose: function () {
                    this.shutdown();

                    this.messages.dispose();
                    this.messages = null;

                    this.state = null;

                    _super.dispose.call(this);
                },

                /**
                 * Hook-method; called when launching the app
                 * @protected
                 */
                onLaunch: alchemy.emptyFn,

                /**
                 * Hook-method; called before closing the app
                 * @protected
                 */
                onShutdown: alchemy.emptyFn,

                /**
                 * Hook-method; called in each loop run to update the application state
                 * @protected
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
                 * @protected
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

                /**
                 * Connects the message bus events with handler/controller
                 *
                 * @param Object controller The controller object to handle the message
                 *      bus events. A controller object has to provide a messages
                 *      property which maps an event to an event handler method. The
                 *      handler method is called with the event data and the current
                 *      application state. The return value of the handler method will
                 *      be the new application state
                 *
                 * @example
                 * var controller = {
                 *   messages: {
                 *     'app:start': 'onAppStart',
                 *     ...
                 *   },
                 *
                 *   onAppStart: function (data, state) {
                 *     ... // handle event
                 *     return newState;
                 *   },
                 *
                 *   ...
                 * };
                 */
                wireUp: function (controller) {
                    if (!controller) {
                        throw 'Invalid input: Empty value';
                    }

                    if (!controller.messages) {
                        throw 'Invalid input: Message map missing';
                    }

                    alchemy.each(controller.messages, function (fnName, message) {
                        this.messages.on(message, function (data) {
                            var fn = controller[fnName];
                            this.state = fn.call(controller, this.state, data);
                        }, this);
                    }, this);
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
            };
        }
    });
}());

