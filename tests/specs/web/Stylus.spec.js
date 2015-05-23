/* global $ */
describe('alchemy.web.Stylus', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        setFixtures([
            '<div id="foo">FOO',
                '<div id="bar" class="bar">BAR',
                    '<div id="baz" class="baz">BAZ</div>',
                '</div>',
            '</div>',
        ].join());

        this.testSubject = alchemy('alchemy.web.Stylus').brew();
    });

    afterEach(function () {
        this.testSubject.dispose();
        this.testSubject = null;
    });

    describe('dispose', function () {
        it('clears the stored data', function () {
            // prepare

            // execute
            this.testSubject.dispose();

            // verify
            expect(this.testSubject.sheet).toBe(null);
            expect(this.testSubject.rules).toBe(null);
        });

        it('removes css rules when beeing disposed', function () {
            // prepare
            this.testSubject.setRules({
                '#foo': {'color': '#FF0000'},
                '#bar': {'color': '#00FF00'},
                '#baz': {'color': '#0000FF'},
            });
            expect($('div#foo')).toHaveCss({color: 'rgb(255, 0, 0)'});
            expect($('div#bar')).toHaveCss({color: 'rgb(0, 255, 0)'});
            expect($('div#baz')).toHaveCss({color: 'rgb(0, 0, 255)'});

            // execute
            this.testSubject.dispose();

            // verify
            expect($('div#foo')).not.toHaveCss({color: 'rgb(255, 0, 0)'});
            expect($('div#bar')).not.toHaveCss({color: 'rgb(0, 255, 0)'});
            expect($('div#baz')).not.toHaveCss({color: 'rgb(0, 0, 255)'});
        });
    });

    describe('setRules', function () {
        it('allows to render css', function () {
            // prepare

            // execute
            this.testSubject.setRules({
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
            this.testSubject.setRules({ '#foo': { 'color': '#00FF00', }, });

            // execute
            this.testSubject.setRules({ '#foo': {'color': '#FF00FF'}, });

            // verify
            expect($('div#foo')).toHaveCss({ 'color': 'rgb(255, 0, 255)', });
        });

        it('supports nested css rules', function () {
            // prepare

            // execute
            this.testSubject.setRules({
                '#foo': {
                    'color': '#FF0000',

                    '#bar': {
                        'color': '#00FF00',

                        '#baz': {
                            'color': '#0000FF',
                        },
                    },
                },
            });

            // verify
            expect($('div#foo')).toHaveCss({color: 'rgb(255, 0, 0)'});
            expect($('div#bar')).toHaveCss({color: 'rgb(0, 255, 0)'});
            expect($('div#baz')).toHaveCss({color: 'rgb(0, 0, 255)'});
        });

        it('supports "&" in nested rules', function () {
            // prepare

            // execute
            this.testSubject.setRules({
                'div': {
                    'color': '#FF0000',

                    '&#bar': {
                        'color': '#00FF00',
                    },
                },
            });

            // verify
            expect($('div#foo')).toHaveCss({color: 'rgb(255, 0, 0)'});
            expect($('div#bar')).toHaveCss({color: 'rgb(0, 255, 0)'});
            expect($('div#baz')).toHaveCss({color: 'rgb(255, 0, 0)'});
        });

        it('supports "," in nested rules', function () {
            // prepare

            // execute
            this.testSubject.setRules({
                '#foo': {
                    'color': '#FF0000',

                    '#bar, #baz': {
                        'color': '#00FF00',
                    },
                },
            });

            // verify
            expect($('div#foo')).toHaveCss({color: 'rgb(255, 0, 0)'});
            expect($('div#bar')).toHaveCss({color: 'rgb(0, 255, 0)'});
            expect($('div#baz')).toHaveCss({color: 'rgb(0, 255, 0)'});
        });
    });
});
