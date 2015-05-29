/* global $ */
describe('alchemy.ecs.CssRenderSystem', function () {
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

    describe('defineEntityType', function () {
        it('allows to render entity type specific css', function () {
            // prepare
            var testSubject = alchemy('alchemy.ecs.CssRenderSystem').brew({
                entities: initEntities()
            });

            testSubject.defineEntityType('someEntity', {
                getStaticCss: function () {
                    return {
                        '#foo': {'color': '#FF0000'},
                        '#bar': {'color': '#00FF00'},
                        '#baz': {'color': '#0000FF'},
                    };
                },
            });

            // execute
            testSubject.update();

            // verify
            expect($('div#foo')).toHaveCss({color: 'rgb(255, 0, 0)'});
            expect($('div#bar')).toHaveCss({color: 'rgb(0, 255, 0)'});
            expect($('div#baz')).toHaveCss({color: 'rgb(0, 0, 255)'});
        });

        it('ignores descriptors which don\'t provide "getStaticCss" method', function () {
            // prepare
            var testSubject = alchemy('alchemy.ecs.CssRenderSystem').brew({
                entities: initEntities()
            });

            // execute
            expect(function () {
                testSubject.defineEntityType('someEntity', {
                    getStaticCss: null
                });

                testSubject.defineEntityType('someOtherEntity', {});

            // verify
            }).not.toThrow();
        });
    });

    describe('update', function () {
        it('allows to render entity specific css', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            apothecarius.createEntity({
                id: 'foo',

                state: {
                    fg: '#00FF00',
                    bg: '#FF00FF',
                },

                css: {
                    entityRules: function (state) {
                        return {
                            'color': state.val('fg'),
                            'background-color': state.val('bg'),
                        };
                    }
                }
            });

            var testSubject = alchemy('alchemy.ecs.CssRenderSystem').brew({
                entities: apothecarius
            });

            // execute
            testSubject.update();

            // verify
            expect($('div#foo')).toHaveCss({
                'color': 'rgb(0, 255, 0)',
                'background-color': 'rgb(255, 0, 255)'
            });
        });

        it('ignores entities where state was unchanged', function () {
            // prepare
            var renderSpy = jasmine.createSpy().andReturn({padding: 0});
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            apothecarius.createEntity({
                id: 'foo',

                state: {
                    foo: 'bar',
                },

                css: {
                    entityRules: renderSpy
                }
            });

            var testSubject = alchemy('alchemy.ecs.CssRenderSystem').brew({
                entities: apothecarius
            });

            testSubject.update();
            renderSpy.reset();

            // execute
            testSubject.update();

            // verify
            expect(renderSpy).not.toHaveBeenCalled();
        });

        it('allows to render static (state-independent) css', function () {
            // prepare
            var apothecarius = initEntities();
            var testSubject = alchemy('alchemy.ecs.CssRenderSystem').brew({
                entities: apothecarius,
            });

            apothecarius.setComponent('foo', 'css', {
                typeRules: {
                    '#foo': {'color': '#FF0000'},
                    '#bar': {'color': '#00FF00'},
                    '#baz': {'color': '#0000FF'},
                },
            });

            // execute
            testSubject.update();

            // verify
            expect($('div#foo')).toHaveCss({color: 'rgb(255, 0, 0)'});
            expect($('div#bar')).toHaveCss({color: 'rgb(0, 255, 0)'});
            expect($('div#baz')).toHaveCss({color: 'rgb(0, 0, 255)'});
        });

        it('allows to render static (state-independent) entity css', function () {
            // prepare
            var apothecarius = initEntities();
            var testSubject = alchemy('alchemy.ecs.CssRenderSystem').brew({
                entities: apothecarius,
            });

            apothecarius.setComponent('foo', 'css', {
                entityRules: {
                    'color': 'rgb(1, 2, 3)'
                },
            });

            // execute
            testSubject.update();

            // verify
            expect($('div#foo')).toHaveCss({color: 'rgb(1, 2, 3)'});
        });

    });

    describe('dispose', function () {
        it('removes the reference to the apothecarius', function () {
            // prepare
            var testSubject = alchemy('alchemy.ecs.CssRenderSystem').brew({
                entities: initEntities()
            });

            // execute
            testSubject.dispose();

            // verify
            expect(testSubject.entities).toBeFalsy();
        });
    });

    function initEntities() {
        var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();

        apothecarius.createEntity({
            id: 'foo',
        });

        return apothecarius;
    }
});
