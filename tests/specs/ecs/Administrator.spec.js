describe('alchemy.ecs.Administrator', function () {
    'use strict';

    var each = require('pro-singulis');
    var immutable = require('immutabilis');
    var coquoVenenum = require('coquo-venenum');
    var Apothecarius = require('./../../../lib/Apothecarius');
    var Administrator = require('./../../../lib/Administrator');

    it('updates all registered systems', function () {
        // prepare
        var state = immutable.fromJS({foo: 'bar'});
        var testSubject = Administrator.brew();
        var testSystem = {
            update: jasmine.createSpy()
        };
        testSubject.addSystem(testSystem);

        // execute
        testSubject.update(state);

        // verify
        expect(testSystem.update).toHaveBeenCalledWith(state);
    });

    it('allows to define an initial set of entities which have children', function () {
        // prepare
        var repo = Apothecarius.brew(repo);
        var testSubject = Administrator.brew({ repo: repo, });

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
        var repo = Apothecarius.brew(repo);
        var testSubject = Administrator.brew({ repo: repo, });

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
        var repo = Apothecarius.brew(repo);
        var testSubject = Administrator.brew({ repo: repo, });
        var state = immutable.fromJS(['foo', 'bar']);

        // execute #1 'init'
        testSubject.initEntities([function (state) {
            return each(state.val(), function (item) {
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
        var repo = Apothecarius.brew(repo);
        var testSubject = Administrator.brew({ repo: repo, });

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
        var repo = Apothecarius.brew(repo);
        var testSubject = Administrator.brew({ repo: repo, });

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

    describe('dispose', function () {
        it('disposes all component systems when disposing app', function () {
            // prepare
            var testSubject = Administrator.brew();
            var testSystem = {
                dispose: jasmine.createSpy()
            };
            testSubject.addSystem(testSystem);

            // execute
            testSubject.dispose();

            // verify
            expect(testSystem.dispose).toHaveBeenCalled();
        });

        it('clears the injected entity repo', function () {
            // prepare
            var System = coquoVenenum({});
            var repo = Apothecarius.brew(repo);
            var testSubject = Administrator.brew({ repo: repo, });
            var system1 = System.brew();
            var system2 = System.brew();

            testSubject.addSystem(system1);
            testSubject.addSystem(system2);

            var repoBefore1 = system1.entities;
            var repoBefore2 = system2.entities;

            // execute
            testSubject.dispose();

            // verify
            expect(repoBefore1).toBe(repo);
            expect(repoBefore2).toBe(repo);
            expect(system1.entities).toBe(null);
            expect(system2.entities).toBe(null);
        });
    });
});
