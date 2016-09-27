/* global $ */
describe('alchemy.ecs.EventSystem', function () {
    'use strict';

    var Delegatus = require('./../../../lib/Delegatus');
    var Apothecarius = require('./../../../old/Apothecarius');
    var EventSystem = require('./../../../old/EventSystem');
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

        this.apothecarius.createEntity({
            id: 'foo',

            events: {
                'click': fooHandler,
            }
        });

        // execute
        this.testSubject.update();
        $('#foo').click();

        // verfiy
        expect(fooHandler).toHaveBeenCalled();
    });

    it('supports backbone-style even definition', function () {
        // prepare
        var barHandler = jasmine.createSpy('click handler for "bar"');
        var bazHandler = jasmine.createSpy('click handler for "baz"');

        this.apothecarius.createEntity({
            id: 'foo',

            events: {
                'click .bar': barHandler,
                'click .baz': bazHandler,
            }
        });

        this.testSubject.update();

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

    it('can delegate browser events to messages', function () {
        // prepare
        var fooHandler = jasmine.createSpy();
        var barHandler = jasmine.createSpy();
        var bazHandler = jasmine.createSpy();

        this.apothecarius.createEntity({
            id: 'foo',

            events: {
                'click': function (ev, state, sendMessage) {
                    sendMessage('fooMessage');
                },
                'click .bar': { message: 'barMessage', },
                'click .baz': 'bazMessage',
            }
        });

        this.messages.on('fooMessage', fooHandler);
        this.messages.on('barMessage', barHandler);
        this.messages.on('bazMessage', bazHandler);

        this.testSubject.update();

        // execute
        $('#foo').click();
        $('.bar').click();
        $('.baz').click();

        // verify
        expect(fooHandler).toHaveBeenCalled();
        expect(barHandler).toHaveBeenCalled();
        expect(bazHandler).toHaveBeenCalled();
    });

    it('removes references when being disposed', function () {
        // prepare
        // execute
        this.testSubject.dispose();

        // verify
        expect(this.testSubject.entities).toBeFalsy();
        expect(this.testSubject.delegator).toBeFalsy();
        expect(this.testSubject.messages).toBeFalsy();
    });
});
