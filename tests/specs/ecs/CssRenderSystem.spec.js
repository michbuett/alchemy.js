/* global $ */
describe('alchemy.lib.CssRenderSystem', function () {
    'use strict';

    var Stylus = require('./../../../lib/Stylus');
    var CssRenderSystem = require('./../../../lib/CssRenderSystem');

    beforeEach(function () {
        this.stylus = Stylus.brew();

        setFixtures([
            '<div id="foo">FOO',
                '<div id="bar">BAR',
                    '<div id=baz>BAZ</div>',
                '</div>',
            '</div>',
        ].join());
    });

    afterEach(function () {
        this.stylus.dispose();
        this.stylus = null;
    });

    describe('update', function () {
        it('allows to render entity specific css', function () {
            // prepare
            var entities = [{
                id: 'foo',
                css: {
                    '#foo': {
                        'color': '#00FF00',
                        'background-color': '#FF00FF',
                    }
                }
            }, {
                id: 'bar',
                css: {
                    '#bar': {
                        'color': '#00FFFF',
                        'background-color': '#00FF00',
                    },
                }
            }];

            var testSubject = CssRenderSystem.brew({
                stylus: this.stylus,
            });

            // execute
            testSubject.update(entities);

            // verify
            expect($('div#foo')).toHaveCss({
                'color': 'rgb(0, 255, 0)',
                'background-color': 'rgb(255, 0, 255)'
            });
            expect($('div#bar')).toHaveCss({
                'color': 'rgb(0, 255, 255)',
                'background-color': 'rgb(0, 255, 0)'
            });
        });

        it('ignores entities without a valid css component', function () {
            // prepare
            var entities = [
                { id: 'foo', css: null, },
                { id: 'bar', css: 'none', }
            ];

            var testSubject = CssRenderSystem.brew({
                stylus: this.stylus,
            });

            // execute
            expect(function () {
                testSubject.update(entities);

            // verify
            }).not.toThrow();
        });
    });

    describe('dispose', function () {
        it('removes the reference to the apothecarius', function () {
            // prepare
            var testSubject = CssRenderSystem.brew({
                stylus: this.stylus,
            });

            // execute
            testSubject.dispose();

            // verify
            expect(testSubject.stylus).toBeFalsy();
        });
    });
});
