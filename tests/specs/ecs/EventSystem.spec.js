/* global $ */
describe('alchemy.ecs.EventSystem', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        setFixtures('<div id="foo"></div>');
    });

    it('allows to delegate DOM events to application messages', function () {
        // prepare
        var delegatus = alchemy('alchemy.web.Delegatus').brew();
        var apothecarius = initEntities();
        var testSubject = alchemy('alchemy.ecs.EventSystem').brew({
            delegator: delegatus,
            entities: apothecarius,
        });
        testSubject.addHandler('fooClick', function () {});

        // execute
        testSubject.update();

        // verify
        expect(apothecarius.getComponentData('foo', 'events')).toBeFalsy();
        expect(apothecarius.getComponentData('foo', 'delegatedEvents')).toEqual([{
            event: 'click',
            delegate: 0,
        }]);
    });

    it('allows to register custom handler functions when defining entity types', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.EventSystem').brew();
        var entityDescriptor = {
            getEventHandler: function () {
            },
        };
        spyOn(entityDescriptor, 'getEventHandler').andCallThrough();

        // execute
        testSubject.defineEntityType('foo', entityDescriptor);

        // verify
        expect(entityDescriptor.getEventHandler).toHaveBeenCalled();
    });

    it('ignores entity descriptors which do not provide new handle', function () {
        expect(function () {
            var testSubject = alchemy('alchemy.ecs.EventSystem').brew();
            testSubject.defineEntityType('foo', {});
        }).not.toThrow();
    });

    it('can delegate browser events to handler methods', function () {
        // prepare
        var testHandler = jasmine.createSpy();
        var delegator = alchemy('alchemy.web.Delegatus').brew();
        var entities = initEntities();
        var testSubject = alchemy('alchemy.ecs.EventSystem').brew({
            entities: entities,
            delegator: delegator,
        });
        var testEl = document.getElementById('foo');
        var entityDescriptor = {
            getEventHandler: function () {
                return {
                    fooClick: testHandler
                };
            },
        };

        // execute
        testSubject.defineEntityType('foo', entityDescriptor);
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
        var delegator = alchemy('alchemy.web.Delegatus').brew();
        var messages = alchemy('alchemy.core.Observari').brew();
        var entities = initEntities();
        var testSubject = alchemy('alchemy.ecs.EventSystem').brew({
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
        var delegator = alchemy('alchemy.web.Delegatus').brew();
        var entities = initEntities();
        var testSubject = alchemy('alchemy.ecs.EventSystem').brew({
            entities: entities,
            delegator: delegator,
        });
        var testEl = document.getElementById('foo');
        var entityDescriptor = {
            getEventHandler: function () {
                return {
                    fooClick: function (event, state) {
                        return {
                            foo: 'foo-2',
                            bar: 'bar-2',
                        };

                    },
                };
            },
        };

        entities.setComponent('foo', 'state', {
            foo: 'foo-1',
            bar: 'bar-1',
        });

        // execute
        testSubject.defineEntityType('foo', entityDescriptor);
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
        var testSubject = alchemy('alchemy.ecs.EventSystem').brew({
            entities: initEntities(),
            delegator: alchemy('alchemy.web.Delegatus').brew(),
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
        var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
        apothecarius.createEntity({
            id: 'foo',

            events: {
                click: {
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
