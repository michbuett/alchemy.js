describe('alchemy.ecs.Applicatus', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');
    var messages = alchemy('alchemy.core.Observari').brew();
    var state = alchemy('alchemy.core.Immutatio').makeImmutable({foo: 'bar'});
    var currentLoopFn;
    var entities = {
        defineEntityType: jasmine.createSpy(),
    };

    it('updates all registered systems', function () {
        // prepare
        var app = createTestSubject();
        var testSystem = {
            update: jasmine.createSpy()
        };
        app.addSystem(testSystem);

        // execute
        tick();

        // verify
        expect(testSystem.update).toHaveBeenCalledWith(state);
    });

    it('delegates newly defines entity types', function () {
        // prepare
        var entityDescriptor;
        var app = createTestSubject();
        var testSystem = {
            defineEntityType: jasmine.createSpy()
        };
        app.addSystem(testSystem);
        app.addSystem({});

        // execute
        app.defineEntityType('foo', entityDescriptor);

        // verify
        expect(entities.defineEntityType).toHaveBeenCalledWith('foo', entityDescriptor);
        expect(testSystem.defineEntityType).toHaveBeenCalledWith('foo', entityDescriptor);
    });

    it('disposes all component systems when disposing app', function () {
        // prepare
        var app = createTestSubject();
        var testSystem = {
            dispose: jasmine.createSpy()
        };
        app.addSystem(testSystem);

        // execute
        app.dispose();

        // verify
        expect(testSystem.dispose).toHaveBeenCalled();
    });

    function createTestSubject() {
        var app = alchemy('alchemy.ecs.Applicatus').brew({
            entities: entities,
            state: state,
            messages: messages,
            requestAnimationFrame: function (fn) {
                currentLoopFn = fn;
            },
        });
        app.launch();

        return app;
    }

    function tick() {
        var fn = currentLoopFn;
        currentLoopFn = null;
        fn(alchemy.now());
    }
});
