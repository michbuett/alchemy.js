describe('alchemy.lib.Applicatus', function () {
    'use strict';

    var utils = require('./../../../lib/Utils');
    var Applicatus = require('./../../../lib/Applicatus');

    function createApp(pcfg) {
        var cfg = {
            requestAnimationFrame: jasmine.createSpy('requestAnimationFrame'),
            cancelAnimationFrame: jasmine.createSpy('cancelAnimationFrame'),
        };

        if (pcfg) {
            cfg = utils.mix(cfg, pcfg);
        }

        return Applicatus.brew(cfg);
    }

    function createLaunchedApp(cfg) {
        var app = createApp(cfg);
        app.launch();
        return app;
    }

    describe('init', function () {
        it('provides a message bus', function () {
            expect(createApp().messages).toBeDefined();
        });
    });

    describe('launch', function () {
        it('makes the application running', function () {
            // prepare
            var app = createApp();
            var beforeLaunch = app.isRunning();
            // execute
            app.launch();
            var afterLaunch = app.isRunning();
            // verify
            expect(beforeLaunch).toBeFalsy();
            expect(afterLaunch).toBeTruthy();
        });

        it('triggers the "app:start"', function () {
            // prepare
            var app = createApp();
            var onAppStart = jasmine.createSpy();
            app.messages.on('app:start', onAppStart);
            // execute
            app.launch();
            // verify
            expect(onAppStart).toHaveBeenCalled();
        });

        it('calls the onLaunch hook', function () {
            // prepare
            var app = createApp();
            app.onLaunch = jasmine.createSpy();
            // execute
            app.launch();
            // verify
            expect(app.onLaunch).toHaveBeenCalled();
        });

        it('will not be excuted when already running', function () {
            // prepare
            var app = createApp();
            var onAppStart = jasmine.createSpy();
            app.launch();
            app.messages.on('app:start', onAppStart);
            app.onLaunch = jasmine.createSpy();
            // execute
            app.launch();
            // verify
            expect(onAppStart).not.toHaveBeenCalled();
            expect(app.onLaunch).not.toHaveBeenCalled();
        });
    });

    describe('shutdown', function () {
        it('makes the application stop running', function () {
            // prepare
            var app = createLaunchedApp();
            var beforeShutdown = app.isRunning();
            // execute
            app.shutdown();
            var afterShutdown = app.isRunning();
            // verify
            expect(beforeShutdown).toBeTruthy();
            expect(afterShutdown).toBeFalsy();
        });

        it('triggers the "app:stop"', function () {
            // prepare
            var app = createLaunchedApp();
            var onAppStop = jasmine.createSpy();
            app.messages.on('app:stop', onAppStop);
            // execute
            app.shutdown();
            // verify
            expect(onAppStop).toHaveBeenCalled();
        });

        it('calls the onShutdown hook', function () {
            // prepare
            var app = createLaunchedApp();
            app.onShutdown = jasmine.createSpy();
            // execute
            app.shutdown();
            // verify
            expect(app.onShutdown).toHaveBeenCalled();
        });

        it('will not be excuted when already running', function () {
            var app = createLaunchedApp();
            var onAppStop = jasmine.createSpy();
            app.shutdown();
            app.onShutdown = jasmine.createSpy();
            app.messages.on('app:stop', onAppStop);
            // execute
            app.shutdown();
            // verify
            expect(onAppStop).not.toHaveBeenCalled();
            expect(app.onShutdown).not.toHaveBeenCalled();
        });
    });

    describe('finish', function () {
        it('stops the animation loop if it has been started', function () {
            // prepare
            var cancelAnimationFrame1 = jasmine.createSpy();
            var app1 = createLaunchedApp({
                requestAnimationFrame: function () {
                    return 42;
                },
                cancelAnimationFrame: cancelAnimationFrame1,
            });

            var cancelAnimationFrame2 = jasmine.createSpy();
            var app2 = createLaunchedApp({
                requestAnimationFrame: function () {
                    return false;
                },
                cancelAnimationFrame: cancelAnimationFrame2,
            });

            // execute
            app1.dispose();
            app2.dispose();

            // verify
            expect(cancelAnimationFrame1).toHaveBeenCalled();
            expect(cancelAnimationFrame2).not.toHaveBeenCalled();
        });

        it('clears the message bus', function () {
            // prepare
            var app = createLaunchedApp();

            // execute
            app.dispose();

            // verify
            expect(app.messages).toBeFalsy();
        });

        it('shuts the app down', function () {
            // prepare
            var app = createLaunchedApp();
            app.shutdown = jasmine.createSpy();

            // execute
            app.dispose();

            // verify
            expect(app.shutdown).toHaveBeenCalled();
        });
    });

    describe('wireUp', function () {
        it('throws an error if no controller object is given', function () {
            var app = createApp();
            expect(function () {
                app.wireUp(null);
            }).toThrow('Invalid input: Empty value');
        });

        it('throws an error if an object without messages property is given', function () {
            var app = createApp();
            expect(function () {
                app.wireUp({});
            }).toThrow('Invalid input: Message map missing');
        });

        it('createDelegates messages to the controller', function () {
            // prepare
            var controller = {
                messages: {
                    foo: 'onFoo',
                    bar: 'onBar',
                    baz: 'onBaz',
                },
                onFoo: jasmine.createSpy(),
                onBar: jasmine.createSpy(),
                onBaz: jasmine.createSpy(),
            };
            var app = createApp();
            app.wireUp(controller);

            // execute
            app.messages.trigger('foo');
            app.messages.trigger('bar');

            // verify
            expect(controller.onFoo).toHaveBeenCalled();
            expect(controller.onBar).toHaveBeenCalled();
            expect(controller.onBaz).not.toHaveBeenCalled();
        });
    });

    describe('update', function () {
        it('allows to update the application state', function () {
            // prepare
            var tick;
            var newState = {};
            var app = createLaunchedApp({
                requestAnimationFrame: function (loopfn) {
                    tick = loopfn;
                },

                update: function () {
                    return newState;
                }
            });


            // execute
            tick();

            // verify
            expect(app.state).toBe(newState);
        });
    });
});
