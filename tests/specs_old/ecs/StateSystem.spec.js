describe('alchemy.old.StateSystem', function () {
    'use strict';

    var immutable = require('immutabilis');
    var Apothecarius = require('./../../../old/Apothecarius');
    var StateSystem = require('./../../../old/StateSystem');

    beforeEach(function () {
        this.state = initState();
        this.apothecarius = initEntities();
    });

    it('updates the entity states according application state', function () {
        // prepare
        var testSubject = StateSystem.brew({
            entities: this.apothecarius
        });

        // execute
        testSubject.update(this.state);

        // verify
        var fooState = this.apothecarius.getComponentData('foo', 'state');
        var barState = this.apothecarius.getComponentData('bar', 'state');
        expect(fooState).toEqual({
            'foo': 'foo-value-1',
            'foo-bar': {
                ping: 'bar-value-1',
                pong: 'bar-value-2',
            },
        });
        expect(barState).toEqual({
            'ping-of-bar': 'bar-value-1',
            'pong-of-bar': 'bar-value-2',
        });
    });

    it('supports dynamic global-to-local-state mapping', function () {
        // prepare
        var testSubject = StateSystem.brew({
            entities: this.apothecarius
        });

        var stateBefore = this.apothecarius.getComponentData('fnTest', 'state');
        var globalToLocalSpy = this.apothecarius.getComponentData('fnTest', 'globalToLocal');

        // execute
        testSubject.update(this.state);

        // verify
        var stateAfter = this.apothecarius.getComponentData('fnTest', 'state');
        expect(globalToLocalSpy).toHaveBeenCalledWith(this.state, stateBefore);
        expect(stateBefore).toEqual({
            fnTestKey: 'fnTestValue-old',
        });
        expect(stateAfter).toEqual({
            fnTestKey: 'fnTestValue-new',
        });
    });

    it('does nothing if application state has not changed', function () {
        // prepare
        var apothecarius = jasmine.createSpyObj(['getAllComponentsOfType']);
        var testSubject = StateSystem.brew({
            entities: apothecarius
        });

        testSubject.update(this.state);
        apothecarius.getAllComponentsOfType.reset();

        // execute
        testSubject.update(this.state);

        // verify
        expect(apothecarius.getAllComponentsOfType).not.toHaveBeenCalled();
    });

    it('removes the reference to the apothecarius', function () {
        // prepare
        var testSubject = StateSystem.brew({
            entities: this.apothecarius
        });

        // execute
        testSubject.dispose();

        // verify
        expect(testSubject.entities).toBeFalsy();
    });

    function initState(state) {
        return immutable.fromJS(state || {
            foo: 'foo-value-1',
            bar: {
                ping: 'bar-value-1',
                pong: 'bar-value-2',
            }

        });
    }

    function initEntities() {
        var apothecarius = Apothecarius.brew();

        apothecarius.createEntity({
            id: 'foo',

            globalToLocal: {
                foo: 'foo',
                bar: 'foo-bar'
            }
        });

        apothecarius.createEntity({
            id: 'bar',

            globalToLocal: {
                'bar.ping': 'ping-of-bar',
                'bar.pong': 'pong-of-bar'
            }
        });

        apothecarius.createEntity({
            id: 'fnTest',

            globalToLocal: jasmine.createSpy().andCallFake(function () {
                return {
                    fnTestKey: 'fnTestValue-new',
                };
            }),

            state: {
                fnTestKey: 'fnTestValue-old'
            },
        });

        return apothecarius;
    }
});
