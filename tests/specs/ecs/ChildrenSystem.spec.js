describe('alchemy.ecs.ChildrenSystem', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        this.apothecarius = initEntities(this.apothecarius);
    });

    it('can create entities', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.ChildrenSystem').brew({
            entities: this.apothecarius
        });

        // execute
        testSubject.update();

        // verify
        expect(this.apothecarius.getAllComponentsOfEntity('id-bar')).toEqual({
            ping: {id: 'id-bar', value: 'ping-bar'},
            pong: {id: 'id-bar', value: 'pong-bar'},
        });
    });

    it('fills the "children"-component', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.ChildrenSystem').brew({
            entities: this.apothecarius
        });

        // execute
        testSubject.update();

        // verify
        var ce = this.apothecarius.getComponent('foo', 'children');
        expect(alchemy.isObject(ce)).toBeTruthy();
        expect(ce.current.val()).toEqual({
            bar: 'id-bar',
            baz: 'id-baz',
        });
    });

    it('clears the fix part of "children"-component', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.ChildrenSystem').brew({
            entities: this.apothecarius
        });

        // execute
        testSubject.update();

        // verify
        expect(this.apothecarius.getComponent('foo', 'children').fix).toBeFalsy();
    });

    it('allows do add new children to existing ones', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.ChildrenSystem').brew({
            entities: this.apothecarius
        });

        // execute
        testSubject.update();

        // verify
        expect(this.apothecarius.getComponent('bli', 'children').current.val()).toEqual({
            bla: 'id-bla',
            blub: 'id-blub',
        });
    });

    it('allows to create entites based on the current entity state', function () {
        // prepare
        var currentState = alchemy('Immutatio').makeImmutable({
            a: 'state-value-A',
            b: 'state-value-B',
            c: 'state-value-C',
        });
        var defaults = this.apothecarius.getComponent('dynTest', 'children').fromState.defaults;
        var dynamicTest = jasmine.createSpy().andCallFake(testStrategy);
        var testSubject = alchemy('alchemy.ecs.ChildrenSystem').brew({
            entities: this.apothecarius
        });
        testSubject.addStrategy('dynamicTest', dynamicTest);
        this.apothecarius.getComponent('dynTest', 'state').current = currentState;

        // execute
        testSubject.update();

        // verify
        expect(dynamicTest).toHaveBeenCalledWith(currentState.val(), defaults);
        expect(this.apothecarius.contains('dyn-test-child-a')).toBeTruthy();
        expect(this.apothecarius.getAllComponentsOfEntity('dyn-test-child-a', 'children')).toEqual({
            foo: {
                id: 'dyn-test-child-a',
                key1: 'foo-value1',
                key2: 'foo-value2',
            },
            bar: {
                id: 'dyn-test-child-a',
                key1: 'bar-value1',
                key2: 'state-value-A',
            }
        });
        expect(this.apothecarius.contains('dyn-test-child-b')).toBeTruthy();
        expect(this.apothecarius.getAllComponentsOfEntity('dyn-test-child-b', 'children')).toEqual({
            foo: {
                id: 'dyn-test-child-b',
                key1: 'foo-value1',
                key2: 'foo-value2',
            },
            bar: {
                id: 'dyn-test-child-b',
                key1: 'bar-value1',
                key2: 'state-value-B',
            }
        });
        expect(this.apothecarius.contains('dyn-test-child-c')).toBeTruthy();
        expect(this.apothecarius.getAllComponentsOfEntity('dyn-test-child-c', 'children')).toEqual({
            foo: {
                id: 'dyn-test-child-c',
                key1: 'foo-value1',
                key2: 'foo-value2',
            },
            bar: {
                id: 'dyn-test-child-c',
                key1: 'bar-value1',
                key2: 'state-value-C',
            }
        });
    });

    it('removes entities which are no longer required as children', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.ChildrenSystem').brew({
            entities: this.apothecarius
        });
        testSubject.addStrategy('dynamicTest', jasmine.createSpy().andCallFake(testStrategy));
        this.apothecarius.getComponent('dynTest', 'state').current = alchemy('Immutatio').makeImmutable({
            a: 'state-value-A',
            b: 'state-value-B',
            c: 'state-value-C',
        });
        testSubject.update();
        expect(this.apothecarius.contains('dyn-test-child-a')).toBeTruthy();
        expect(this.apothecarius.contains('dyn-test-child-b')).toBeTruthy();
        expect(this.apothecarius.contains('dyn-test-child-c')).toBeTruthy();

        // execute
        this.apothecarius.getComponent('dynTest', 'state').current = alchemy('Immutatio').makeImmutable({
            a: 'state-value-A',
            c: 'state-value-C',
        });
        testSubject.update();

        // verify
        expect(this.apothecarius.contains('dyn-test-child-a')).toBeTruthy();
        expect(this.apothecarius.contains('dyn-test-child-b')).toBeFalsy();
        expect(this.apothecarius.contains('dyn-test-child-c')).toBeTruthy();
    });

    function initEntities() {
        var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
        var dummyState = {};

        apothecarius.createEntity({
            id: 'foo',
            children: {
                fix: {
                    bar: {
                        id: 'id-bar',
                        ping: {value: 'ping-bar'},
                        pong: {value: 'pong-bar'},
                    },
                    baz: {
                        id: 'id-baz',
                        ping: {value: 'ping-baz'},
                        pong: {value: 'pong-baz'},
                    },
                },
            },
        });

        apothecarius.createEntity({
            id: 'bli',
            children: {
                current: alchemy('Immutatio').makeImmutable({
                    blub: 'id-blub'
                }),
                fix: {
                    bla: {
                        id: 'id-bla',
                        ping: {value: 'ping-bar'},
                        pong: {value: 'pong-bar'},
                    },
                },
            },
        });

        apothecarius.createEntity({
            id: 'dynTest',
            children: {
                fromState: {
                    strategy: 'dynamicTest',
                    defaults: {
                        foo: {
                            key1: 'foo-value1',
                            key2: 'foo-value2',
                        },
                        bar: {
                            key1: 'bar-value1',
                            key2: 'bar-value2',
                        }
                    }
                },
            },
            state: {
                current: dummyState,
                last: dummyState,
            }
        });

        return apothecarius;
    }

    function testStrategy(state, defaults) {
        return alchemy.each(state, function (val, index) {
            var barCmp = alchemy.mix({}, defaults.bar, {
                key2: val,
            });

            return alchemy.mix({}, defaults, {
                id: 'dyn-test-child-' + index,
                bar: barCmp
            });
        });
    }
});
