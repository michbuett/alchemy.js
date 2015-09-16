/* global $ */
describe('alchemy.ecs.EventSystem', function () {
    'use strict';

    var Delegatus = require('./../../../lib/web/Delegatus');
    var Apothecarius = require('./../../../lib/ecs/Apothecarius');
    var EventSystem = require('./../../../lib/ecs/EventSystem');
    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        setFixtures('<div id="foo"></div>');
    });

    it('allows to delegate DOM events to application messages', function () {
        // prepare
        var delegatus = Delegatus.brew();
        var apothecarius = initEntities();
        var testSubject = EventSystem.brew({
            delegator: delegatus,
            entities: apothecarius,
        });
        testSubject.addHandler('fooClick', function () {});

        // execute
        testSubject.update();

        // verify
        expect(apothecarius.getComponentData('foo', 'events')).toBeFalsy();
        expect(apothecarius.getComponentData('foo', 'delegatedEvents')).toEqual([{
            selector: '#foo',
            event: 'click',
            delegate: 0,
        }]);
    });

    it('supports backbone-style even definition', function () {
        // prepare
        var testSubject = EventSystem.brew({
            delegator: Delegatus.brew(),
            entities: Apothecarius.brew(),
        });

        var entityId = testSubject.entities.createEntity({
            events: {
                'click .foo .bar': function () {},
                'click #baz': function () {},
            }
        });

        // execute
        testSubject.update();

        // verify
        expect(testSubject.entities.getComponentData(entityId, 'delegatedEvents')).toEqual([{
            selector: '.foo .bar',
            event: 'click',
            delegate: 0,
        }, {
            selector: '#baz',
            event: 'click',
            delegate: 1,
        }]);
    });

    it('can delegate browser events to handler methods', function () {
        // prepare
        var testHandler = jasmine.createSpy();
        var delegator = Delegatus.brew();
        var entities = initEntities();
        var testSubject = EventSystem.brew({
            entities: entities,
            delegator: delegator,
        });
        var testEl = document.getElementById('foo');

        // execute
        testSubject.addHandler('fooClick', testHandler);
        testSubject.update();
        var del = entities.getComponentData('foo', 'delegatedEvents')[0];
        delegator.delegateKey(del.event, del.delegate, testEl);
        $(testEl).click();

        // verify
        expect(testHandler).toHaveBeenCalled();
    });

    it('can delegate browser events to messages', function () {
        // prepare
        var eventData;
        var testHandler = jasmine.createSpy().andCallFake(function (data) {
            eventData = data;
        });
        var delegator = Delegatus.brew();
        var messages = alchemy('alchemy.core.Observari').brew();
        var entities = initEntities();
        var testSubject = EventSystem.brew({
            entities: entities,
            delegator: delegator,
            messages: messages,
        });
        var testEl = document.getElementById('foo');
        messages.on('fooMessage', testHandler);

        // execute
        testSubject.update();
        var del = entities.getComponentData('bar', 'delegatedEvents')[0];
        delegator.delegateKey(del.event, del.delegate, testEl);
        $(testEl).click();

        // verify
        expect(testHandler).toHaveBeenCalled();
        expect(eventData).toEqual({foo: 'bar'});
    });

    it('allows an event handler to update the entities state', function () {
        // prepare
        var delegator = Delegatus.brew();
        var entities = initEntities();
        var testSubject = EventSystem.brew({
            entities: entities,
            delegator: delegator,
        });
        var testEl = document.getElementById('foo');

        testSubject.addHandler('fooClick', function (event, state) {
            return {
                foo: 'foo-2',
                bar: 'bar-2',
            };
        });
        entities.setComponent('foo', 'state', {
            foo: 'foo-1',
            bar: 'bar-1',
        });

        // execute
        testSubject.update();
        var del = entities.getComponentData('foo', 'delegatedEvents')[0];
        delegator.delegateKey(del.event, del.delegate, testEl);
        $(testEl).click();

        // verify
        expect(entities.getComponentData('foo', 'state')).toEqual({
            foo: 'foo-2',
            bar: 'bar-2',
        });
    });

    it('removes references when being disposed', function () {
        // prepare
        var testSubject = EventSystem.brew({
            entities: initEntities(),
            delegator: Delegatus.brew(),
            messages: alchemy('alchemy.core.Observari').brew(),
        });

        // execute
        testSubject.dispose();

        // verify
        expect(testSubject.entities).toBeFalsy();
        expect(testSubject.delegator).toBeFalsy();
        expect(testSubject.messages).toBeFalsy();
    });

    function initEntities() {
        var apothecarius = Apothecarius.brew();
        apothecarius.createEntity({
            id: 'foo',

            events: {
                click: {
                    selector: '#foo',
                    handler: 'fooClick',
                }
            },
        });

        apothecarius.createEntity({
            id: 'bar',
            state: {
                foo: 'bar',
            },

            events: {
                click: {
                    message: 'fooMessage',
                }
            },

            delegatedEvents: []
        });

        apothecarius.createEntity({
            id: 'baz',

            delegatedEvents: []
        });
        return apothecarius;
    }
});
