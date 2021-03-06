/* global $ */
describe('alchemy.lib.Delegatus', function () {
    'use strict';

    var Delegatus = require('./../../lib/Delegatus');

    beforeEach(function () {
        setFixtures([
            '<div id="sandbox">',
              '<ul>',
                '<li id="foo" class="ping">Foo</li>',
                '<li id="bar" class="ping">Bar</li>',
                '<li id="baz" class="pong">Baz</li>',
              '</ul>',
            '</div>',
        ].join(''));
    });

    describe('addEventListener', function () {
        it('allows to delegate mouse events', function () {
            // prepare
            var handler = jasmine.createSpy();
            var delegatus = Delegatus.brew({
                root: document.body,
            });

            // execute
            delegatus.addEventListener('click #foo', handler);
            $('#foo').click();

            // verify
            expect(handler).toHaveBeenCalled();
        });

        it('allows to delegate keyboard events', function () {
            // prepare
            var keyupHandler = jasmine.createSpy();
            var keydownHandler = jasmine.createSpy();
            var keypressHandler = jasmine.createSpy();
            var delegatus = Delegatus.brew({
                root: document.body,
            });

            // execute
            delegatus.addEventListener('keydown #foo', keydownHandler);
            delegatus.addEventListener('keyup #foo', keyupHandler);
            delegatus.addEventListener('keypress #foo', keypressHandler);
            triggerKeyboardEvent('keydown', '#foo');
            triggerKeyboardEvent('keyup', '#foo');
            triggerKeyboardEvent('keypress', '#foo');

            // verify
            expect(keydownHandler).toHaveBeenCalled();
            expect(keyupHandler).toHaveBeenCalled();
            expect(keypressHandler).toHaveBeenCalled();
        });

        it('allows to filter using css selectors', function () {
            // prepare
            var handler = jasmine.createSpy();
            var delegatus = Delegatus.brew({
                root: document.body,
            });

            // execute #1
            delegatus.addEventListener('click #sandbox .ping', handler);
            $('.pong').click();

            // verify #1
            expect(handler).not.toHaveBeenCalled();

            // execute #2
            $('.ping').click();

            // verify #2
            expect(handler).toHaveBeenCalled();
        });

        it('ignores events which occur not on a target element', function () {
            var root = document.getElementById('sandbox');
            var handler = jasmine.createSpy();
            var delegatus = Delegatus.brew({
                root: root
            });

            delegatus.addEventListener('click #foo', handler);

            // execute
            $('#bar').click();
            $('#foo').dblclick();

            // verify
            expect(handler).not.toHaveBeenCalled();
        });

    });

    describe('dispose', function () {
        it('clears references to dom node and event emitter', function () {
            // prepare
            var delegatus = Delegatus.brew({
                root: document.body,
            });
            // execute
            delegatus.dispose();
            // verify
            expect(delegatus.root).toBeFalsy();
        });

        it('stops delegating when disposed', function () {
            // prepare
            var handler1 = jasmine.createSpy();
            var handler2 = jasmine.createSpy();
            var delegatus = Delegatus.brew({
                root: document.body,
            });

            delegatus.addEventListener('click #foo', handler1);
            delegatus.addEventListener('click #bar', handler2);

            // execute
            $('#foo').click();
            delegatus.dispose();
            $('#bar').click();

            // verify
            expect(handler1).toHaveBeenCalled();
            expect(handler2).not.toHaveBeenCalled();
        });
    });

    function triggerKeyboardEvent(eventName, selector) {
        var ev = document.createEvent('KeyboardEvent');
        var el = document.querySelector(selector);

        ev.initEvent(eventName, true, true);
        el.dispatchEvent(ev);
    }
});
