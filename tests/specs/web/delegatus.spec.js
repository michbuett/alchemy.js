/* global $ */
describe('alchemy.web.Delegatus', function () {
    'use strict';

    var Delegatus = require('./../../../lib/web/Delegatus');

    beforeEach(function () {
        setFixtures([
            '<div id="sandbox">',
              '<ul>',
                '<li id="foo">Foo</li>',
                '<li id="bar">Bar</li>',
                '<li id="baz">Baz</li>',
              '</ul>',
            '</div>',
        ].join(''));
    });

    describe('createDelegate', function () {
        it('can create a delegation key', function () {
            var delegatus = Delegatus.brew({
                root: document.getElementById('sandbox')
            });

            var handler = function () {};

            var delegate1 = delegatus.createDelegate('click', handler);
            var delegate2 = delegatus.createDelegate('click', handler);

            expect(typeof delegate1).toBe('object');
            expect(typeof delegate1.bind).toBe('function');
            expect(delegate2).toBe(delegate1);
        });

        it('allows to delegate dom events', function () {
            // prepare
            var el = document.getElementById('foo');
            var delegatus = Delegatus.brew({
                root: document.body,
            });
            var handler = jasmine.createSpy();

            // execute
            delegatus.createDelegate('click', handler).bind(el);
            $(el).click();

            // verify
            expect(handler).toHaveBeenCalled();
        });

        it('ignores events which occur not on a target element', function () {
            var root = document.getElementById('sandbox');
            var el = document.getElementById('foo');
            var delegatus = Delegatus.brew({
                root: root
            });
            var handler = jasmine.createSpy();
            delegatus.createDelegate('click', handler).bind(el);

            // execute
            $('#bar').click();
            $('#foo').dblclick();

            // verify
            expect(handler).not.toHaveBeenCalled();
        });

        it('re-uses event handlers', function () {
            var el = document.getElementById('foo');
            var delegatus = Delegatus.brew({
                root: document.getElementById('sandbox')
            });
            var handler = function () {};
            var scope = {};

            // execute
            delegatus.createDelegate('click', handler, scope).bind(el);
            delegatus.createDelegate('click', handler, scope).bind(el);
            delegatus.createDelegate('click', handler, scope).bind(el);

            // verify
            expect(delegatus.events.click.length).toBe(1);
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
            var delegatus = Delegatus.brew({
                root: document.body,
            });
            var elFoo = document.getElementById('foo');
            var elBar = document.getElementById('bar');
            var handler1 = jasmine.createSpy();
            var handler2 = jasmine.createSpy();

            // execute
            delegatus.createDelegate('click', handler1).bind(elFoo);
            delegatus.createDelegate('click', handler2).bind(elBar);
            $(elFoo).click();
            delegatus.dispose();
            $(elBar).click();

            // verify
            expect(handler1).toHaveBeenCalled();
            expect(handler2).not.toHaveBeenCalled();
        });
    });
});
