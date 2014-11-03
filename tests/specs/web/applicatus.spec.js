describe('alchemy.web.Applicatus', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    function createApp(pcfg) {
        var cfg = {
            requestAnimationFrame: jasmine.createSpy('requestAnimationFrame'),
            cancelAnimationFrame: jasmine.createSpy('cancelAnimationFrame'),
        };

        if (pcfg) {
            cfg = alchemy.mix(cfg, pcfg);
        }

        return alchemy('alchemy.web.Applicatus').brew(cfg);
    }

    function createLaunchedApp(cfg) {
        var app = createApp(cfg);
        app.launch();
        return app;
    }

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
});
