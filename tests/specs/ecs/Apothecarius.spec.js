describe('alchemy.ecs.Apothecarius', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    /** @name TEST_createEntity */
    describe('createEntity', function () {
        it('returns an entity id', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();

            // execute
            var entityId = apothecarius.createEntity({});

            // verify
            expect(typeof entityId).toBe('string');
            expect(entityId).not.toBe('');
            expect(apothecarius.contains(entityId)).toBeTruthy();
        });

        it('allows to define components', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var testComponents = {
                foo: {
                    key: 'value-foo'
                },
                bar: {
                    key: 'value-bar'
                },
            };

            // execute
            var entityId = apothecarius.createEntity(testComponents);
            var allComponent = apothecarius.getAllComponentsOfEntity(entityId);
            var fooComponent = apothecarius.getComponentData(entityId, 'foo');
            var barComponent = apothecarius.getComponentData(entityId, 'bar');

            // verify
            expect(typeof entityId).toBe('string');
            expect(allComponent.foo).toBe(fooComponent);
            expect(allComponent.bar).toBe(barComponent);
            expect(fooComponent).toEqual({ key: 'value-foo', });
            expect(barComponent).toEqual({ key: 'value-bar', });
        });

        it('allows to retrieve all components of a type', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var e1 = apothecarius.createEntity({
                foo: {
                    value: 'foo-e1'
                }
            });
            var e2 = apothecarius.createEntity({
                foo: {
                    value: 'foo-e2'
                }
            });
            var expectedResult = {};
            expectedResult[e1] = { value: 'foo-e1', };
            expectedResult[e2] = { value: 'foo-e2', };

            // execute
            var result = apothecarius.getAllComponentsOfType('foo');

            // verify
            expect(result).toEqual(expectedResult);
        });

        it('allows to retrieve all components of an entity', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var entityId = apothecarius.createEntity({
                foo: {
                    key: 'value-foo'
                },
                bar: {
                    key: 'value-bar'
                },
            });

            // execute
            var result = apothecarius.getAllComponentsOfEntity(entityId);

            // verify
            expect(result).toEqual({
                foo: {
                    key: 'value-foo'
                },
                bar: {
                    key: 'value-bar'
                },
            });
        });

        it('throws an exception when trying to create an entity with an id that is already in use', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var entityId = apothecarius.createEntity({});
            // execute/verify
            expect(function () {
                apothecarius.createEntity({
                    id: entityId
                });
            }).toThrow('The id: "' + entityId + '" is already used');
        });

        it('allows to define non-object components', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var cfg = {
                foo: 'foo',
                bar: ['bar'],
                baz: function baz() {},
            };

            // execute
            var entityId = apothecarius.createEntity(cfg);

            // verify
            expect(apothecarius.getComponentData(entityId, 'foo')).toEqual(cfg.foo);
            expect(apothecarius.getComponentData(entityId, 'bar')).toEqual(cfg.bar);
            expect(apothecarius.getComponentData(entityId, 'baz')).toEqual(cfg.baz);
        });
    });

    /** @name TEST_setComponent */
    describe('setComponent', function () {
        it('allows to add a component from a given entity', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var entityId = apothecarius.createEntity({
                foo: {
                    key: 'value-foo'
                },
            });

            // execute
            var allComponentBefore = apothecarius.getAllComponentsOfEntity(entityId);
            var result = apothecarius.setComponent(entityId, 'bar', {
                key: 'value-bar'
            });
            var allComponentAfter = apothecarius.getAllComponentsOfEntity(entityId);

            // verify
            expect(Object.keys(allComponentBefore)).toEqual(['foo']);
            expect(Object.keys(allComponentAfter)).toEqual(['foo', 'bar']);
            expect(result).toBe(apothecarius.getComponentData(entityId, 'bar'));
        });

        it('allows to update a component from a given entity', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var entityId = apothecarius.createEntity({
                foo: {
                    key1: 'value1',
                    key2: 'value2',
                },
            });

            // execute
            var before = apothecarius.getComponentData(entityId, 'foo');
            var after = apothecarius.setComponent(entityId, 'foo', { key1: 'value1-modified' });

            // verify
            expect(before).toEqual({ key1: 'value1', key2: 'value2'});
            expect(after).toEqual({ key1: 'value1-modified', key2: 'value2'});
        });

        it('throws an exception when trying to add a component to not existent exception', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            // execute/verify
            expect(function () {
                apothecarius.setComponent('foo', 'bar', {});
            }).toThrow('Unknown entity: "foo"');
        });
    });

    describe('removeComponent', function () {
        it('allows to remove a component from a given entity', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var entityId = apothecarius.createEntity({
                foo: {
                    key: 'value-foo'
                },
                bar: {
                    key: 'value-bar'
                },
            });

            // execute
            var allComponentBefore = apothecarius.getAllComponentsOfEntity(entityId);
            var allOfTypeBefore = apothecarius.getAllComponentsOfType('bar');

            apothecarius.removeComponent(entityId, 'bar');

            var allComponentAfter = apothecarius.getAllComponentsOfEntity(entityId);
            var allOfTypeAfter = apothecarius.getAllComponentsOfType('bar');

            // verify
            expect(Object.keys(allComponentBefore)).toEqual(['foo', 'bar']);
            expect(Object.keys(allComponentAfter)).toEqual(['foo']);
            expect(Object.keys(allOfTypeBefore)).toEqual([entityId]);
            expect(Object.keys(allOfTypeAfter)).toEqual([]);
        });

        it('ignores unknown components', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var entityId = apothecarius.createEntity({
                foo: {
                    key: 'value-foo'
                },
                bar: {
                    key: 'value-bar'
                },
            });

            // execute
            var allComponentBefore = apothecarius.getAllComponentsOfEntity(entityId);
            apothecarius.removeComponent(entityId, 'baz');
            var allComponentAfter = apothecarius.getAllComponentsOfEntity(entityId);

            // verify
            expect(Object.keys(allComponentBefore)).toEqual(['foo', 'bar']);
            expect(Object.keys(allComponentAfter)).toEqual(['foo', 'bar']);
        });

        it('throws an exception when trying to remove a component from a non-existent exception', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            // execute/verify
            expect(function () {
                apothecarius.removeComponent('foo', 'bar');
            }).toThrow('Unknown entity: "foo"');
        });
    });

    /** @name TEST_removeEntity */
    describe('removeEntity', function () {
        it('can remove a single entity', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var entityId = apothecarius.createEntity({
                foo: {
                    key: 'value-foo'
                },
                bar: {
                    key: 'value-bar'
                },
            });

            // execute
            var containsBefore = apothecarius.contains(entityId);
            apothecarius.removeEntity(entityId);
            var containsAfter = apothecarius.contains(entityId);

            // verify
            expect(containsBefore).toBeTruthy();
            expect(containsAfter).toBeFalsy();
        });

        it('ignores non-existing entities', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();

            // execute
            expect(function () {
                apothecarius.removeEntity('some-unknown-entity');

            // verify
            }).not.toThrow();
        });
    });

    /** @name TEST_removeAllEntities */
    describe('removeAllEntities', function () {
        it('can remove all entities at once', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var entity1 = apothecarius.createEntity({});
            var entity2 = apothecarius.createEntity({});
            var entity3 = apothecarius.createEntity({});

            // execute
            var containsBefore1 = apothecarius.contains(entity1);
            var containsBefore2 = apothecarius.contains(entity2);
            var containsBefore3 = apothecarius.contains(entity3);
            apothecarius.removeAllEntities();
            var containsAfter1 = apothecarius.contains(entity1);
            var containsAfter2 = apothecarius.contains(entity1);
            var containsAfter3 = apothecarius.contains(entity1);

            // verify
            expect(containsBefore1).toBeTruthy();
            expect(containsBefore2).toBeTruthy();
            expect(containsBefore3).toBeTruthy();
            expect(containsAfter1).toBeFalsy();
            expect(containsAfter2).toBeFalsy();
            expect(containsAfter3).toBeFalsy();
        });
    });

    /** @name TEST_dispose */
    describe('dispose', function () {
        it('clears all stored entities when being disposed', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            spyOn(apothecarius, 'removeAllEntities').andCallThrough();

            // execute
            apothecarius.dispose();

            // verify
            expect(apothecarius.removeAllEntities).toHaveBeenCalled();
        });
    });
});
