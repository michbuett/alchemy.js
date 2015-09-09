describe('alchemy.ecs.Administrator', function () {
    'use strict';

    var immutable = require('immutabilis');
    var alchemy = require('./../../../lib/core/Alchemy.js');

    it('updates all registered systems', function () {
        // prepare
        var state = immutable.fromJS({foo: 'bar'});
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

    it('allows to define an initial set of entities which have children', function () {
        // prepare
        var repo = alchemy('alchemy.ecs.Apothecarius').brew(repo);
        var testSubject = alchemy('alchemy.ecs.Administrator').brew({ repo: repo, });

        // execute
        testSubject.initEntities([{
            id: 'foo',
            children: {
                bar: {
                    id: 'bar',
                    children: {
                        baz: {
                            id: 'baz'
                        }
                    }
                }
            }
        }]);

        // verify
        expect(repo.contains('foo')).toBeTruthy();
        expect(repo.contains('bar')).toBeTruthy();
        expect(repo.contains('baz')).toBeTruthy();
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
        var state = immutable.fromJS(['foo', 'bar']);

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

    it('allows to define default components for an entity type', function () {
        // prepare
        var repo = alchemy('alchemy.ecs.Apothecarius').brew(repo);
        var testSubject = alchemy('alchemy.ecs.Administrator').brew({ repo: repo, });

        testSubject.setEntityDefaults('foobar', {
            foo: {
                key: 'key-foo',
                value: 'value-foo',
            },

            bar: {
                key: 'key-bar',
                value: 'value-bar',
            },
        });

        // execute
        var entityId = testSubject.createEntity({
            type: 'foobar'
        });

        // verify
        expect(repo.getAllComponentsOfEntity(entityId)).toEqual({
            foo: {
                key: 'key-foo',
                value: 'value-foo',
            },
            bar: {
                key: 'key-bar',
                value: 'value-bar',
            },
        });
    });

    it('allows to override component defaults', function () {
        // prepare
        var repo = alchemy('alchemy.ecs.Apothecarius').brew(repo);
        var testSubject = alchemy('alchemy.ecs.Administrator').brew({ repo: repo, });

        testSubject.setEntityDefaults('foobar', {
            foo: {
                key: 'key-foo',
                value: 'value-foo',
            },

            bar: {
                key: 'key-bar',
                value: 'value-bar',
            },
        });

        // execute
        var entityId = testSubject.createEntity({
            type: 'foobar',
            foo: {
                value: 'value-foo-new'
            }
        });

        // verify
        expect(repo.getAllComponentsOfEntity(entityId)).toEqual({
            foo: {
                key: 'key-foo',
                value: 'value-foo-new',
            },
            bar: {
                key: 'key-bar',
                value: 'value-bar',
            },
        });
    });
});
