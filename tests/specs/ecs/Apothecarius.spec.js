describe('alchemy.ecs.Apothecarius', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    /** @name TEST_createEntity */
    describe('createEntity', function () {
        it('returns an entity id', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();

            // execute
            var entityId = apothecarius.createEntity();

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
            var fooComponent = apothecarius.getComponent(entityId, 'foo');
            var barComponent = apothecarius.getComponent(entityId, 'bar');

            // verify
            expect(typeof entityId).toBe('string');
            expect(allComponent.foo).toBe(fooComponent);
            expect(allComponent.bar).toBe(barComponent);
            expect(fooComponent).toEqual({
                id: entityId,
                key: 'value-foo',
            });
            expect(barComponent).toEqual({
                id: entityId,
                key: 'value-bar',
            });
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

            // execute
            var result = apothecarius.getAllComponentsOfType('foo');

            // verify
            expect(alchemy.isArray(result)).toBeTruthy();
            expect(result).toEqual([{
                id: e1,
                value: 'foo-e1',
            }, {
                id: e2,
                value: 'foo-e2',
            }]);
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
                    id: entityId,
                    key: 'value-foo'
                },
                bar: {
                    id: entityId,
                    key: 'value-bar'
                },
            });
        });

        it('throws an exception when trying to create an entity with an id that is already in use', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var entityId = apothecarius.createEntity();
            // execute/verify
            expect(function () {
                apothecarius.createEntity({
                    id: entityId
                });
            }).toThrow('The id: "' + entityId + '" is already used');
        });
    });

    /** @name TEST_defineEntityType */
    describe('defineEntityType', function () {
        it('allows to define defaults for an entity', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var defaults = {
                foo: {
                    key: 'key-foo',
                    value: 'value-foo',
                },
                bar: {
                    key: 'key-bar',
                    value: 'value-bar',
                },
            };

            // execute
            apothecarius.defineEntityType('foobar', {
                getComponents: function () {
                    return defaults;
                },
            });

            // verify
            var entityId = apothecarius.createEntity('foobar');
            expect(apothecarius.getAllComponentsOfEntity(entityId)).toEqual({
                foo: {
                    id: entityId,
                    key: 'key-foo',
                    value: 'value-foo',
                },
                bar: {
                    id: entityId,
                    key: 'key-bar',
                    value: 'value-bar',
                },
            });
        });

        it('allows to override component defaults', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var defaults = {
                foo: {
                    key: 'key-foo',
                    value: 'value-foo',
                },
                bar: {
                    key: 'key-bar',
                    value: 'value-bar',
                },
            };
            apothecarius.defineEntityType('foobar', {
                getComponents: function () {
                    return defaults;
                },
            });

            // execute
            var entityId = apothecarius.createEntity({
                type: 'foobar',
                foo: {
                    value: 'value-foo-new'
                }
            });

            // verify
            expect(apothecarius.getAllComponentsOfEntity(entityId)).toEqual({
                foo: {
                    id: entityId,
                    key: 'key-foo',
                    value: 'value-foo-new',
                },
                bar: {
                    id: entityId,
                    key: 'key-bar',
                    value: 'value-bar',
                },
            });
        });

        it('throws an exception when trying to define the same type twice', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var provider = {
                getComponents: function () {
                    return {};
                }
            };
            apothecarius.defineEntityType('foo', provider);

            // execute/verify
            expect(function () {
                apothecarius.defineEntityType('foo', provider);

            // verify
            }).toThrow('The entity type "foo" is already defined!');
        });

        it('ignores descriptors which don\'t provide the getComponents method', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var provider = {
                getComponents: null
            };
            apothecarius.defineEntityType('foo', provider);

            // execute/verify
            expect(function () {
                apothecarius.defineEntityType('foo', provider);

            // verify
            }).not.toThrow();
        });
    });

    /** @name TEST_addComponent */
    describe('addComponent', function () {
        it('allows to remove a component from a given entity', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var entityId = apothecarius.createEntity({
                foo: {
                    key: 'value-foo'
                },
            });

            // execute
            var allComponentBefore = apothecarius.getAllComponentsOfEntity(entityId);
            var result = apothecarius.addComponent(entityId, 'bar', {
                key: 'value-bar'
            });
            var allComponentAfter = apothecarius.getAllComponentsOfEntity(entityId);

            // verify
            expect(Object.keys(allComponentBefore)).toEqual(['foo']);
            expect(Object.keys(allComponentAfter)).toEqual(['foo', 'bar']);
            expect(result).toBe(apothecarius.getComponent(entityId, 'bar'));
        });

        it('throws an exception when trying to add a component to not existent exception', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            // execute/verify
            expect(function () {
                apothecarius.addComponent('foo', 'bar', {});
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
            apothecarius.removeComponent(entityId, 'bar');
            var allComponentAfter = apothecarius.getAllComponentsOfEntity(entityId);

            // verify
            expect(Object.keys(allComponentBefore)).toEqual(['foo', 'bar']);
            expect(Object.keys(allComponentAfter)).toEqual(['foo']);
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
    });

    describe('removeAllEntities', function () {
        it('can remove all entities at once', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            var entity1 = apothecarius.createEntity();
            var entity2 = apothecarius.createEntity();
            var entity3 = apothecarius.createEntity();

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
