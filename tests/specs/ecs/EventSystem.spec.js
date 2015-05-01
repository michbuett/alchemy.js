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
        expect(apothecarius.getComponent('foo', 'events')).toBeFalsy();
        expect(apothecarius.getComponent('foo', 'delegatedEvents').current.val()).toEqual([{
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
        var del = entities.getComponent('foo', 'delegatedEvents').current.val()[0];
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
        var del = entities.getComponent('bar', 'delegatedEvents').current.val()[0];
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
                        return state.set({
                            foo: 'foo-2',
                            bar: 'bar-2',
                        });

                    },
                };
            },
        };
        var state = alchemy('Immutatio').makeImmutable({
            foo: 'foo-1',
            bar: 'bar-1',
        });

        entities.addComponent('foo', 'state', {
            current: state,
            last: state,
        });

        // execute
        testSubject.defineEntityType('foo', entityDescriptor);
        testSubject.update();
        var del = entities.getComponent('foo', 'delegatedEvents').current.val()[0];
        delegator.delegateKey(del.event, del.delegate, testEl);
        $(testEl).click();

        // verify
        var actualState = entities.getComponent('foo', 'state');
        expect(actualState.last.val()).toEqual({
            foo: 'foo-1',
            bar: 'bar-1',
        });
        expect(actualState.current.val()).toEqual({
            foo: 'foo-2',
            bar: 'bar-2',
        });
    });

    it('updates the "delegatedEvents" property', function () {
        // prepare
        var delegator = alchemy('alchemy.web.Delegatus').brew();
        var entities = initEntities();
        var testSubject = alchemy('alchemy.ecs.EventSystem').brew({
            entities: entities,
            delegator: delegator,
        });

        // execute
        testSubject.update();

        // verify
        var bazDelegates = entities.getComponent('baz', 'delegatedEvents');
        expect(bazDelegates.last).toBe(bazDelegates.current);
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
                current: alchemy('Immutatio').makeImmutable({foo: 'bar'}),
            },

            events: {
                click: {
                    message: 'fooMessage',
                }
            },
            delegatedEvents: {
                current: alchemy('Immutatio').makeImmutable([])
            }
        });

        apothecarius.createEntity({
            id: 'baz',
            delegatedEvents: {
                current: alchemy('Immutatio').makeImmutable([])
            }
        });
        return apothecarius;
    }
});
