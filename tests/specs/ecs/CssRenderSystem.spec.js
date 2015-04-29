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
                    current: alchemy('Immutatio').makeImmutable({
                        fg: '#00FF00',
                        bg: '#FF00FF',
                    }),
                },

                css: {
                    renderer: function (state) {
                        return {
                            '#foo': {
                                'color': state.val('fg'),
                                'background-color': state.val('bg'),
                            },
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
            var state = alchemy('Immutatio').makeImmutable({'foo': 'bar'});
            var renderSpy = jasmine.createSpy();
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            apothecarius.createEntity({
                id: 'foo',

                state: {
                    current: state,
                    last: state,
                },

                css: {
                    renderer: renderSpy
                }
            });

            var testSubject = alchemy('alchemy.ecs.CssRenderSystem').brew({
                entities: apothecarius
            });

            // execute
            testSubject.update();

            // verify
            expect(renderSpy).not.toHaveBeenCalled();
        });

        it('ignores css components without renderer', function () {
            // prepare
            var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
            apothecarius.createEntity({
                id: 'foo',

                state: {
                    current: alchemy('Immutatio').makeImmutable({fg: '#00FF00'})
                },

                css: {
                    renderer: null
                }
            });

            var testSubject = alchemy('alchemy.ecs.CssRenderSystem').brew({
                entities: apothecarius
            });

            // execute
            expect(function () {
                testSubject.update();

            // verify
            }).not.toThrow();
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
