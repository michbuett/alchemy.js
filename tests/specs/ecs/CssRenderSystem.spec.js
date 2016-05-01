/* global $ */
describe('alchemy.ecs.CssRenderSystem', function () {
    'use strict';

    var Apothecarius = require('./../../../lib/Apothecarius');
    var Stylus = require('./../../../lib/Stylus');
    var CssRenderSystem = require('./../../../lib/CssRenderSystem');
    var immutable = require('immutabilis');

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
            var state = immutable.fromJS({ fg: '#00FF00', bg: '#FF00FF', });
            var apothecarius = Apothecarius.brew();
            apothecarius.createEntity({
                id: 'foo',

                css: {
                    entityRules: function (state) {
                        return {
                            'color': state.val('fg'),
                            'background-color': state.val('bg'),
                        };
                    }
                }
            });

            var testSubject = CssRenderSystem.brew({
                stylus: this.stylus,
                entities: apothecarius
            });

            // execute
            testSubject.update(state);

            // verify
            expect($('div#foo')).toHaveCss({
                'color': 'rgb(0, 255, 0)',
                'background-color': 'rgb(255, 0, 255)'
            });
        });

        it('ignores entities where state was unchanged', function () {
            // prepare
            var state = immutable.fromJS({ foo: 'bar' });
            var renderSpy = jasmine.createSpy().andReturn({padding: 0});
            var apothecarius = Apothecarius.brew();
            apothecarius.createEntity({
                id: 'foo',

                css: {
                    entityRules: renderSpy
                }
            });

            var testSubject = CssRenderSystem.brew({
                stylus: this.stylus,
                entities: apothecarius
            });

            testSubject.update(state);
            expect(renderSpy).toHaveBeenCalled();
            renderSpy.reset();

            // execute
            testSubject.update(state);

            // verify
            expect(renderSpy).not.toHaveBeenCalled();
        });

        it('allows tp transform the application state to an entity specific (sub) state', function () {
            // prepare
            var state = immutable.fromJS({
                foo: {
                    bar: 'baz',
                },
            });

            var renderSpy = jasmine.createSpy().andReturn({padding: 0});

            var apothecarius = Apothecarius.brew();
            apothecarius.createEntity({
                id: 'foo',

                css: {
                    entityRules: renderSpy,
                    stateMap: function (appState) {
                        return appState.sub('foo').sub('bar');
                    }
                }
            });

            var testSubject = CssRenderSystem.brew({
                stylus: this.stylus,
                entities: apothecarius
            });

            // execute
            testSubject.update(state);
            testSubject.update(state.set('foo', { baz: 'baz'}));

            // verify
            expect(renderSpy).toHaveBeenCalledWith(immutable.fromJS('baz'));
            expect(renderSpy.calls.count()).toBe(1);
        });

        it('allows to render static (state-independent) css', function () {
            // prepare
            var apothecarius = initEntities();
            var testSubject = CssRenderSystem.brew({
                stylus: this.stylus,
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
            testSubject.update({});

            // verify
            expect($('div#foo')).toHaveCss({color: 'rgb(255, 0, 0)'});
            expect($('div#bar')).toHaveCss({color: 'rgb(0, 255, 0)'});
            expect($('div#baz')).toHaveCss({color: 'rgb(0, 0, 255)'});
        });

        it('allows to render static (state-independent) entity css', function () {
            // prepare
            var apothecarius = initEntities();
            var testSubject = CssRenderSystem.brew({
                stylus: this.stylus,
                entities: apothecarius,
            });

            apothecarius.setComponent('foo', 'css', {
                entityRules: {
                    'color': 'rgb(1, 2, 3)'
                },
            });

            // execute
            testSubject.update({});

            // verify
            expect($('div#foo')).toHaveCss({color: 'rgb(1, 2, 3)'});
        });

    });

    describe('dispose', function () {
        it('removes the reference to the apothecarius', function () {
            // prepare
            var testSubject = CssRenderSystem.brew({
                stylus: this.stylus,
                entities: initEntities()
            });

            // execute
            testSubject.dispose();

            // verify
            expect(testSubject.entities).toBeFalsy();
        });
    });

    function initEntities() {
        var apothecarius = Apothecarius.brew();

        apothecarius.createEntity({
            id: 'foo',
        });

        return apothecarius;
    }
});
