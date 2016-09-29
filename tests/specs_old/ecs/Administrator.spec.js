describe('alchemy.old.Administrator', function () {
    'use strict';

    var each = require('pro-singulis');
    var immutable = require('immutabilis');
    var coquoVenenum = require('coquo-venenum');
    var Apothecarius = require('./../../../old/Apothecarius');
    var Administrator = require('./../../../old/Administrator');

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
            id: 'foo-entity-id',
            children: {
                bar: {
                    id: 'bar-entity-id',
                    children: [{
                        id: 'baz-entity-id'
                    }]
                }
            }
        }]);

        // verify
        expect(repo.contains('foo-entity-id')).toBeTruthy();
        expect(repo.contains('bar-entity-id')).toBeTruthy();
        expect(repo.contains('baz-entity-id')).toBeTruthy();
        expectChildren('foo-entity-id', repo).toEqual({ bar: 'bar-entity-id' }); // defined as key-value-pair
        expectChildren('bar-entity-id', repo).toEqual(['baz-entity-id']); // defined as array
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
        testSubject.initEntities([{
            id: 'some-entity-id',
            children: function (state) {
                return each(state.val(), function (item) {
                    return {
                        id: item
                    };
                });
            }
        }], state);

        // verify #1
        expect(repo.contains('foo')).toBeTruthy();
        expect(repo.contains('bar')).toBeTruthy();
        expect(repo.contains('baz')).toBeFalsy();
        expectChildren('some-entity-id', repo).toEqual(['foo', 'bar']); // children fn returns an array

        // execute #2 'update (no changes)'
        testSubject.update(state);

        // verify #2
        expect(repo.contains('foo')).toBeTruthy();
        expect(repo.contains('bar')).toBeTruthy();
        expect(repo.contains('baz')).toBeFalsy();
        expectChildren('some-entity-id', repo).toEqual(['foo', 'bar']);

        // execute #3 'update (for real)'
        testSubject.update(state.set(['bar', 'baz']));

        // verify #3
        expect(repo.contains('foo')).toBeFalsy();
        expect(repo.contains('bar')).toBeTruthy();
        expect(repo.contains('baz')).toBeTruthy();
        expectChildren('some-entity-id', repo).toEqual(['bar', 'baz']);
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

    /** @private */
    function expectChildren(entityId, repo) {
        return expect(repo.getComponentData(entityId, 'children'));
    }
});
