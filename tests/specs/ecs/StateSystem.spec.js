describe('alchemy.ecs.StateSystem', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        this.state = initState();
        this.apothecarius = initEntities();
    });

    it('updates the entity states according application state', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.StateSystem').brew({
            entities: this.apothecarius
        });

        // execute
        testSubject.update(this.state);

        // verify
        var fooState = this.apothecarius.getComponent('foo', 'state').current;
        var barState = this.apothecarius.getComponent('bar', 'state').current;
        expect(fooState.val()).toEqual({
            'foo': 'foo-value-1',
            'foo-bar': {
                ping: 'bar-value-1',
                pong: 'bar-value-2',
            },
        });
        expect(barState.val()).toEqual({
            'ping-of-bar': 'bar-value-1',
            'pong-of-bar': 'bar-value-2',
        });
    });

    it('can initialize the state using the "initial" property', function () {
        // prepare
        var fooState = this.apothecarius.getComponent('foo', 'state');
        var testSubject = alchemy('alchemy.ecs.StateSystem').brew({
            entities: this.apothecarius
        });

        fooState.globalToLocal = null;
        fooState.initial = {
            'foo': 'foo-value-0',
        };

        // execute
        testSubject.update(this.state);

        // verify
        expect(fooState.current.val()).toEqual({
            'foo': 'foo-value-0',
        });
    });

    it('ignores entities if they do not have a "globalToLocal" property', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.StateSystem').brew({
            entities: this.apothecarius
        });

        // execute
        var stateBefore = this.apothecarius.getComponent('baz', 'state').current;
        testSubject.update(this.state);
        var stateAfter = this.apothecarius.getComponent('baz', 'state').current;

        // verify
        expect(stateBefore).toBe(stateAfter);
    });

    it('supports dynamic global-to-local-state mapping', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.StateSystem').brew({
            entities: this.apothecarius
        });

        var stateBefore = this.apothecarius.getComponent('fnTest', 'state').current;
        var globalToLocalSpy = this.apothecarius.getComponent('fnTest', 'state').globalToLocal;

        // execute
        testSubject.update(this.state);

        // verify
        var stateAfter = this.apothecarius.getComponent('fnTest', 'state').current;
        expect(globalToLocalSpy).toHaveBeenCalledWith(this.state, stateBefore);
        expect(stateBefore.val()).toEqual({
            fnTestKey: 'fnTestValue-old',
        });
        expect(stateAfter.val()).toEqual({
            fnTestKey: 'fnTestValue-new',
        });
    });

    function initState(state) {
        return alchemy('alchemy.core.Immutatio').makeImmutable(state || {
            foo: 'foo-value-1',
            bar: {
                ping: 'bar-value-1',
                pong: 'bar-value-2',
            }

        });
    }

    function initEntities() {
        var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();

        apothecarius.createEntity({
            id: 'foo',
            state: {
                globalToLocal: {
                    foo: 'foo',
                    bar: 'foo-bar'
                }
            },
        });

        apothecarius.createEntity({
            id: 'bar',
            state: {
                globalToLocal: {
                    'bar.ping': 'ping-of-bar',
                    'bar.pong': 'pong-of-bar'
                }
            },
        });

        apothecarius.createEntity({
            id: 'baz',
            state: {
                current: {
                    baz: 'baz-value'
                }
            },
        });

        apothecarius.createEntity({
            id: 'fnTest',
            state: {
                globalToLocal: jasmine.createSpy().andCallFake(function () {
                    return alchemy('Immutatio').makeImmutable({
                        fnTestKey: 'fnTestValue-new',
                    });
                }),

                current: alchemy('Immutatio').makeImmutable({
                    fnTestKey: 'fnTestValue-old'
                }),
            },
        });

        return apothecarius;
    }
});
