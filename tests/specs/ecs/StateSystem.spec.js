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

        return apothecarius;
    }
});
