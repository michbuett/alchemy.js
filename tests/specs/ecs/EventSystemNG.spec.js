/* global $ */
describe('alchemy.ecs.EventSystemNG', function () {
    'use strict';

    var Delegatus = require('./../../../lib/Delegatus');
    var Apothecarius = require('./../../../lib/Apothecarius');
    var EventSystem = require('./../../../lib/EventSystemNG');
    var Observari = require('../../../lib/Observari');

    beforeEach(function () {
        setFixtures('<div id="foo"><div class="bar"></div><div class="baz"></div></div>');

        this.delegatus = Delegatus.brew();

        this.apothecarius = Apothecarius.brew();

        this.messages = Observari.brew();

        this.testSubject = EventSystem.brew({
            delegator: this.delegatus,
            entities: this.apothecarius,
            messages: this.messages,
        });
    });

    it('allows to register event listeners', function () {
        // prepare
        var fooHandler = jasmine.createSpy();

        var entities = new Map([
            ['foo', {
                id: 'foo',
                events: { 'click': fooHandler, }
            }]
        ]);

        // execute
        this.testSubject.update(entities);
        $('#foo').click();

        // verfiy
        expect(fooHandler).toHaveBeenCalled();
    });

    it('supports backbone-style even definition', function () {
        // prepare
        var barHandler = jasmine.createSpy('click handler for "bar"');
        var bazHandler = jasmine.createSpy('click handler for "baz"');

        var entities = new Map([
            ['foo', {
                id: 'foo',
                events: {
                    'click .bar': barHandler,
                    'click .baz': bazHandler,
                }
            }]
        ]);

        this.testSubject.update(entities);

        // execute #1
        $('.bar').click();

        // verfiy #1
        expect(barHandler).toHaveBeenCalled();
        expect(bazHandler).not.toHaveBeenCalled();

        // execute #2
        barHandler.reset();
        $('.baz').click();

        // verfiy #2
        expect(barHandler).not.toHaveBeenCalled();
        expect(bazHandler).toHaveBeenCalled();
    });

    it('allows to change the delegated handler function', function () {
        // prepare
        var handler1 = jasmine.createSpy('first click handler for "bar"');
        var handler2 = jasmine.createSpy('second click handler for "bar"');

        var entities1 = new Map([
            ['foo', { id: 'foo', events: { 'click': handler1, } }]
        ]);
        var entities2 = new Map([
            ['foo', { id: 'foo', events: { 'click': handler2, } }]
        ]);

        // execute #1
        this.testSubject.update(entities1);
        $('#foo').click();

        // verfiy #1
        expect(handler1).toHaveBeenCalled();
        expect(handler2).not.toHaveBeenCalled();

        // execute #2
        this.testSubject.update(entities2);
        handler1.reset();
        $('#foo').click();

        // verfiy #2
        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).toHaveBeenCalled();
    });

    it('can delegate browser events to messages', function () {
        // prepare
        var fooHandler = jasmine.createSpy();

        var entities = new Map([
            ['foo', {
                id: 'foo',
                events: {
                    'click': function (ev, sendMessage) {
                        sendMessage('fooMessage');
                    },
                }
            }]
        ]);

        this.messages.on('fooMessage', fooHandler);

        this.testSubject.update(entities);

        // execute
        $('#foo').click();

        // verify
        expect(fooHandler).toHaveBeenCalled();
    });

    it('skips entites without a valid event compontent', function () {
        // prepare
        var testSubject = this.testSubject;
        var entities = new Map([
            ['foo', { id: 'foo', events: null, }],
            ['bar', { id: 'bar', events: function () {}, }],
            ['baz', { id: 'baz', events: { none: 'ok' }, }],
        ]);

        // execute
        expect(function () {
            testSubject.update(entities);

        // verify
        }).not.toThrow();
    });

    it('removes references when being disposed', function () {
        // prepare
        var entities = new Map([
            ['foo', { id: 'foo', events: { 'click': function () {}, } }]
        ]);
        this.testSubject.update(entities);

        // execute
        this.testSubject.dispose();

        // verify
        expect(this.testSubject.delegator).toBeFalsy();
        expect(this.testSubject.messages).toBeFalsy();
        expect(this.testSubject.handlers).toBeFalsy();
        expect(this.testSubject.sendMessage).toBeFalsy();
    });
});
