/* global $ */
describe('alchemy.web.Stylus', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        setFixtures([
            '<div id="foo">FOO',
                '<div id="bar">BAR',
                    '<div id=baz>BAZ</div>',
                '</div>',
            '</div>',
        ].join());
    });

    describe('dispose', function () {
        it('clears the stored data', function () {
            // prepare
            var testSubject = alchemy('alchemy.web.Stylus').brew();

            // execute
            testSubject.dispose();

            // verify
            expect(testSubject.sheet).toBe(null);
            expect(testSubject.rules).toBe(null);
        });
    });

    describe('setRules', function () {
        it('allows to render css', function () {
            // prepare
            var testSubject = alchemy('alchemy.web.Stylus').brew();

            // execute
            testSubject.setRules({
                '#foo': {'color': '#FF0000'},
                '#bar': {'color': '#00FF00'},
                '#baz': {'color': '#0000FF'},
            });

            // verify
            expect($('div#foo')).toHaveCss({color: 'rgb(255, 0, 0)'});
            expect($('div#bar')).toHaveCss({color: 'rgb(0, 255, 0)'});
            expect($('div#baz')).toHaveCss({color: 'rgb(0, 0, 255)'});
        });

        it('allows to override css rules', function () {
            // prepare
            var testSubject = alchemy('alchemy.web.Stylus').brew();
            testSubject.setRules({ '#foo': { 'color': '#00FF00', }, });

            // execute
            testSubject.setRules({ '#foo': {'color': '#FF00FF'}, });

            // verify
            expect($('div#foo')).toHaveCss({ 'color': 'rgb(255, 0, 255)', });
        });
    });
});
