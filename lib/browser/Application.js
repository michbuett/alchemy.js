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

        requires: [
            'alchemy.core.Oculus',
            'alchemy.browser.Resources',
            'alchemy.browser.Entities'
        ],

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
             * The list of application modules; An application module is an extention
             * of the current application which handles the actual appliaction logic.
             * Each module has the same lifecycle as the application itself. So it should
             * implement the methods "prepare", "update", "draw" and "finish". You can
             * use {@link alchemy.emptyFn} as an empty implementation
             *
             * @property modules
             * @type Object[]
             * @private
             */
            modules: undefined,

            /**
             * Initialize application instance; It is recommended to call the
             * super method when overriding alchemy.browser.Application.init
             * @protected
             */
            init: function () {
                this.frames = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                this.boundLoopFn = this.loop.bind(this);

                this.messages = alchemy('Oculus').brew();
                this.resources = alchemy('Resources').brew();
                this.entities = alchemy('Entities').brew({
                    messages: this.messages,
                    resources: this.resources
                });

                alchemy.each(this.modules, this.initModule, this);

                if (alchemy.isString(this.config)) {
                    this.resources.load({
                        src: 'data/app.json',
                    }, {
                        success: function (resource) {
                            this.applyConfig(resource.data);
                        },
                        scope: this
                    });
                } else if (alchemy.isObject(this.config)) {
                    this.applyConfig(this.config);
                }
            },

            /**
             * Initializes a single application module
             * @private
             */
            initModule: function (item, index) {
                var potion;
                var cfg = {
                    app: this,
                    messages: this.messages,
                    resources: this.resources,
                    entities: this.entities,
                };

                if (alchemy.isString(item)) {
                    potion = item;
                } else if (alchemy.isObject(item)) {
                    potion = item.potion;
                    delete item.potion;
                    cfg = alchemy.mix(cfg, item);
                }

                if (potion) {
                    this.modules[index] = alchemy(potion).brew(cfg);
                }
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
                    alchemy.each(this.modules, function (mod) {
                        mod.finish();
                    }, this);
                    this.runs = false;
                }
            },

            /**
             * Override super type to dispose modules, resource manager, message bus
             * and entity manager
             * @function
             */
            dispose: alchemy.override(function (_super) {
                return function () {
                    alchemy.each(this.modules, function (mod) {
                        mod.dispose();
                    }, this);

                    this.resources.dispose();
                    this.entities.dispose();
                    this.messages.dispose();

                    _super.call(this);
                };
            }),

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
             * @function
             * @private
             */
            loop: (function () {
                var loopParams = {}; // the parameter for each loop
                var args; // the addition arguments for updateModule/drawModule methods

                // helper method to call the "update" method of a single application module
                function updateModule(mod, key, params) {
                    mod.update(params);
                }

                // helper method to call the "draw" method of a single application module
                function drawModule(mod, key, params) {
                    mod.draw(params);
                }

                return function () {
                    if (this.runs) {
                        var frame = this.frame++;
                        var currentTick = Date.now();
                        var diff = (currentTick - this.lastTick) || 1;

                        this.lastTick = currentTick;
                        this.frames.shift();
                        this.frames.push(1000 / diff);

                        this.reqAnimFrame(this.boundLoopFn);

                        if (!this.paused) {
                            // update the parameter set for the current iteration
                            loopParams.frame = frame;
                            loopParams.now = currentTick;
                            args = args || [loopParams];

                            // update application logic
                            this.update(loopParams);
                            alchemy.each(this.modules, updateModule, this, args);

                            // update application view
                            this.draw(loopParams);
                            alchemy.each(this.modules, drawModule, this, args);
                        }
                    }
                };
            }()),

            /**
             * applies the application configuration (resources, entity definitions, ...)
             * @private
             */
            applyConfig: function (cfg) {
                // define initial resources
                this.resources.define(cfg.resources);

                // initialize entity manager with the loaded component configuration entity archetypes
                this.entities.initEntityTypes(cfg.entities);

                // load all defined resources
                this.resources.loadAll({
                    success: this.handleResourcesSuccess,
                    failure: this.handleResourcesFailure,
                    finished: this.handleResourcesFinished,
                    scope: this
                });
            },

            /**
             * Callback for loading a single resource
             * @private
             */
            handleResourcesSuccess: function (resource, progress) {
                /**
                 * Fired after a single resources has been loaded
                 * @event
                 * @name resource:loaded
                 * @param {Object} data The event data
                 * @param {Object} data.resource The loaded resource
                 * @param {Object} data.progress The overall resource loading progress
                 */
                this.messages.trigger('resource:loaded', {
                    resource: resource,
                    progress: progress
                });
            },

            /**
             * Callback in case a resource cannot be loaded
             * @private
             */
            handleResourcesFailure: function (resource, progress, cfg) {
                /**
                 * Fired after a single resources has been failed to loaded
                 * @event
                 * @name resource:error
                 * @param {Object} data The event data
                 * @param {Object} data.resource The resource configuration which failed to load
                 */
                this.messages.trigger('resource:loaded', {
                    resource: resource,
                    progress: progress
                });

            },

            /**
             * Callback in case all resources are loaded
             * @private
             */
            handleResourcesFinished: function () {
                /**
                 * Fired after all resources are loaded
                 * @event
                 * @name app:resourcesloaded
                 */
                this.messages.trigger('app:resourcesloaded');

                // initialize application and modules
                this.prepare();
                alchemy.each(this.modules, function (mod) {
                    mod.prepare();
                }, this);

                /**
                 * Fired after application is ready
                 * @event
                 * @name app:start
                 */
                this.messages.trigger('app:start');
            }
        }
    });
}());

