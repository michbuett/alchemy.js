(function () {
    'use strict';

    var alchemy = require('./alchemy.js');
    var requestAnimationFrame = window.requestAnimationFrame;
    var cancelAnimationFrame = window.cancelAnimationFrame;

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
            'alchemy.core.Observari',
            'alchemy.browser.Resources',
            'alchemy.browser.Entities'
        ],

        overrides: {
            /** @lends alchemy.browser.Application.prototype */

            /**
             * The application title; will be applied to document.title
             * when brewing the app instance
             *
             * @property title
             * @type String
             */
            title: undefined,

            /**
             * <code>true</code> if the app is ready to launch (configuration
             * is loaded and all resources are loaded)
             *
             * @property ready
             * @type Boolean
             * @private
             */
            ready: false,

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
                if (this.title) {
                    document.title = this.title;
                }

                this.messages = alchemy('Observari').brew();
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
             * Starts the application loop;
             * This will call the {@link #prepare} hook method of the application
             * itself and the prepare method of each module
             */
            launch: function () {
                if (this.runs) {
                    return;
                }

                if (!this.ready) {
                    this.messages.once('app:resourcesloaded', this.launch, this);
                    return;
                }

                this.runs = true;
                this.frame = 0;
                this.lastTick = window.performance.now();

                // initialize application and modules (call hooks)
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

                // start the update/draw-loop
                // this.startTime = Date.now();
                this.boundLoopFn = this.createLoopFunction(this);
                this.boundLoopFn();
            },

            /**
             * stops the application loop;
             * this will call the {@link #finish} method
             */
            end: function () {
                if (this.runs) {
                    if (this.loopId) {
                        cancelAnimationFrame(this.loopId);
                        this.boundLoopFn = null;
                        this.loopId = null;
                    }

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
                    this.end();

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
             * Creats the application loop method which called every iteration;
             * will call the {@link #update} and the {@link #draw} method
             * @function
             * @private
             */
            createLoopFunction: function (app) {
                // helper method to call the "update" method of a single application module
                function updateModule(mod, key, params) {
                    mod.update(params);
                }

                // helper method to call the "draw" method of a single application module
                function drawModule(mod, key, params) {
                    mod.draw(params);
                }

                var then = alchemy.now();
                var frame = 0;
                var loopParams = {}; // the parameter for each loop
                var args = [loopParams]; // the addition arguments for updateModule/drawModule methods
                var fps = 60;
                var delay = 1000 / fps;

                return function loop(now) {
                    now  = now || alchemy.now();

                    delay = 0.95 * delay + 0.05 * (now - then);
                    fps = 1000 / delay;
                    then = now;
                    frame++;

                    if (!this.paused) {
                        // update the parameter set for the current iteration
                        loopParams.frame = frame;
                        loopParams.now = now;
                        loopParams.delay = Math.round(delay);
                        loopParams.fps = Math.round(fps);
                        args = args || [loopParams];

                        // update application logic
                        app.update(loopParams);
                        alchemy.each(app.modules, updateModule, app, args);

                        // update application view
                        app.draw(loopParams);
                        alchemy.each(app.modules, drawModule, app, args);
                    }

                    app.loopId = requestAnimationFrame(app.boundLoopFn);
                };
            },

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
            handleResourcesFailure: function (resource, progress) {

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
                this.ready = true;

                /**
                 * Fired after all resources are loaded
                 * @event
                 * @name app:resourcesloaded
                 */
                this.messages.trigger('app:resourcesloaded');
            }
        }
    });
}());

