describe('alchemy.ecs.Administrator', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    it('updates all registered systems', function () {
        // prepare
        var state = alchemy('alchemy.core.Immutatio').makeImmutable({foo: 'bar'});
        var testSubject = alchemy('alchemy.ecs.Administrator').brew();
        var testSystem = {
            update: jasmine.createSpy()
        };
        testSubject.addSystem(testSystem);

        // execute
        testSubject.update(state);

        // verify
        expect(testSystem.update).toHaveBeenCalledWith(state);
    });

    it('delegates newly defines entity types', function () {
        // prepare
        var entityDescriptor;
        var testSubject = alchemy('alchemy.ecs.Administrator').brew({
            repo: { defineEntityType: jasmine.createSpy(), },
        });
        var testSystem = {
            defineEntityType: jasmine.createSpy()
        };
        testSubject.addSystem(testSystem);
        testSubject.addSystem({});

        // execute
        testSubject.defineEntityType('foo', entityDescriptor);

        // verify
        expect(testSubject.repo.defineEntityType).toHaveBeenCalledWith('foo', entityDescriptor);
        expect(testSubject.repo.defineEntityType).toHaveBeenCalledWith('foo', entityDescriptor);
    });

    it('disposes all component systems when disposing app', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.Administrator').brew();
        var testSystem = {
            dispose: jasmine.createSpy()
        };
        testSubject.addSystem(testSystem);

        // execute
        testSubject.dispose();

        // verify
        expect(testSystem.dispose).toHaveBeenCalled();
    });

    it('allows to define an initial set of entities', function () {
        // prepare
        var repo = alchemy('alchemy.ecs.Apothecarius').brew(repo);
        var testSubject = alchemy('alchemy.ecs.Administrator').brew({ repo: repo, });

        // execute
        testSubject.initEntities([{
            id: 'foo'
        }, {
            id: 'bar'
        }, {
            id: 'baz'
        }]);

        // verify
        expect(repo.contains('foo')).toBeTruthy();
        expect(repo.contains('bar')).toBeTruthy();
        expect(repo.contains('baz')).toBeTruthy();
    });

    it('allows to define state dependent entities', function () {
        // prepare
        var repo = alchemy('alchemy.ecs.Apothecarius').brew(repo);
        var testSubject = alchemy('alchemy.ecs.Administrator').brew({ repo: repo, });
        var state = alchemy('alchemy.core.Immutatio').makeImmutable(['foo', 'bar']);

        // execute #1 'init'
        testSubject.initEntities([function (state) {
            return alchemy.each(state.val(), function (item) {
                return {
                    id: item
                };
            });
        }], state);

        // verify #1
        expect(repo.contains('foo')).toBeTruthy();
        expect(repo.contains('bar')).toBeTruthy();
        expect(repo.contains('baz')).toBeFalsy();

        // execute #2 'update (no changes)'
        testSubject.update(state);

        // verify #2
        expect(repo.contains('foo')).toBeTruthy();
        expect(repo.contains('bar')).toBeTruthy();
        expect(repo.contains('baz')).toBeFalsy();

        // execute #3 'update (for real)'
        testSubject.update(state.set(['bar', 'baz']));

        // verify #3
        expect(repo.contains('foo')).toBeFalsy();
        expect(repo.contains('bar')).toBeTruthy();
        expect(repo.contains('baz')).toBeTruthy();
    });
});
