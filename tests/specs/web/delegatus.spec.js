/* global $ */
describe('alchemy.web.Delegatus', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

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

    describe('delegate', function () {
        it('allows to delegate dom events', function () {
            // prepare
            var el = document.getElementById('foo');
            var delegatus = alchemy('alchemy.web.Delegatus').brew({
                root: document.body,
            });
            var handler = jasmine.createSpy();

            // execute
            delegatus.delegate(el, 'click', handler);
            $(el).click();

            // verify
            expect(handler).toHaveBeenCalled();
        });

        it('ignores invalid input', function () {
            // prepare
            var el = document.getElementById('foo');
            var delegatus = alchemy('alchemy.web.Delegatus').brew({
                root: document.body,
            });

            expect(function () {
                delegatus.delegate();
            }).not.toThrow();

            expect(function () {
                delegatus.delegate(el);
            }).not.toThrow();

            expect(function () {
                delegatus.delegate(el, 'click');
            }).not.toThrow();
        });

        it('ignores events which occure not on a target element', function () {
            var root = document.getElementById('sandbox');
            var el = document.getElementById('foo');
            var delegatus = alchemy('alchemy.web.Delegatus').brew({
                root: root
            });
            var handler = jasmine.createSpy();
            delegatus.delegate(el, 'click', handler);

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
            var delegatus = alchemy('alchemy.web.Delegatus').brew({
                root: document.body,
            });
            // execute
            delegatus.dispose();
            // verify
            expect(delegatus.root).toBeFalsy();
        });

        it('stops delegating when disposed', function () {
            // prepare
            var delegatus = alchemy('alchemy.web.Delegatus').brew({
                root: document.body,
            });
            var elFoo = document.getElementById('foo');
            var elBar = document.getElementById('bar');
            var handler1 = jasmine.createSpy();
            var handler2 = jasmine.createSpy();

            // execute
            delegatus.delegate(elFoo, 'click', handler1);
            delegatus.delegate(elBar, 'click', handler2);
            $(elFoo).click();
            delegatus.dispose();
            $(elBar).click();

            // verify
            expect(handler1).toHaveBeenCalled();
            expect(handler2).not.toHaveBeenCalled();
        });
    });
});
