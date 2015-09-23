/* global $ */
describe('alchemy.ecs.EventSystem', function () {
    'use strict';

    var Delegatus = require('./../../../lib/Delegatus');
    var Apothecarius = require('./../../../lib/Apothecarius');
    var EventSystem = require('./../../../lib/EventSystem');
    var Observari = require('../../../lib/Observari');

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
        var delegatedEvents = apothecarius.getComponentData('foo', 'delegatedEvents');
        expect(apothecarius.getComponentData('foo', 'events')).toBeFalsy();
        expect(delegatedEvents[0].selector).toBe('#foo');
        expectToBeDelegate(delegatedEvents[0].delegate);
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
        var delegatedEvents = testSubject.entities.getComponentData(entityId, 'delegatedEvents');
        expect(delegatedEvents[0].selector).toBe('.foo .bar');
        expectToBeDelegate(delegatedEvents[0].delegate);
        expect(delegatedEvents[1].selector).toBe('#baz');
        expectToBeDelegate(delegatedEvents[1].delegate);
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
        del.delegate.bind(testEl);
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
        var messages = Observari.brew();
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
        del.delegate.bind(testEl);
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
        del.delegate.bind(testEl);
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
            messages: Observari.brew(),
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

    function expectToBeDelegate(subj) {
        expect(typeof subj).toBe('object');
        expect(typeof subj.bind).toBe('function');
    }
});
