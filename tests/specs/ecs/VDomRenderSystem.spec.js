/* global $ */
describe('alchemy.ecs.VDomRenderSystem', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        setFixtures(sandbox());

        this.apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();

        initRenderer();
        initEntities(this.apothecarius);
    });

    it('renders the entities to the DOM', function () {
        // prepare
        var renderer = alchemy('alchemy.ecs.VDomRenderSystem').brew({
            entities: this.apothecarius
        });

        // execute
        renderer.update();

        // verify
        expect($('div#foo')).toExist();
        expect($('div#foo div#bar.bla')).toExist();
        expect($('div#foo div#baz.baz-class')).toExist();
        expect($('div#foo div#bar.bla div#ping')).toExist();
        expect($('div#foo div#bar.bla div#pong')).toExist();
    });

    it('renders the update when changing the state', function () {
        // prepare
        var renderer = alchemy('alchemy.ecs.VDomRenderSystem').brew({
            entities: this.apothecarius
        });

        renderer.update();

        this.apothecarius.setComponent('bar', 'state', {
            bla: 'blub'
        });

        // execute
        renderer.update();

        // verify
        expect($('div#foo div#bar.blub')).toExist();
        expect($('div#foo div#bar.blub div#ping')).toExist();
        expect($('div#foo div#bar.blub div#pong')).toExist();
    });

    it('binds delegated events handler', function () {
        // prepare
        var testHandler = jasmine.createSpy();
        var delegator = alchemy('alchemy.web.Delegatus').brew();
        var delegateKey = delegator.delegateHandler('click', testHandler);
        var renderer = alchemy('alchemy.ecs.VDomRenderSystem').brew({
            delegator: delegator,
            entities: this.apothecarius
        });

        renderer.update();
        this.apothecarius.setComponent('foo', 'delegatedEvents', [{
            event: 'click',
            delegate: delegateKey,
        }]);

        // execute
        renderer.update();
        $('#foo').click();

        // verify
        expect(testHandler).toHaveBeenCalled();
    });

    it('throws an exception if renderer cannot be determined', function () {
        // prepare
        var renderer = alchemy('alchemy.ecs.VDomRenderSystem').brew({
            entities: this.apothecarius
        });

        this.apothecarius.createEntity({
            id: 'invalid-renderer-test',
            vdom: {}
        });

        // execute
        expect(function () {
            renderer.update();

        // verify
        }).toThrow('Cannot determine renderer for entity "invalid-renderer-test"!');
    });

    it('skips entities which have no parent dom element', function () {
        // prepare
        var renderer = alchemy('alchemy.ecs.VDomRenderSystem').brew({
            entities: this.apothecarius
        });

        this.apothecarius.createEntity({
            id: 'no-parent-dom',
            vdom: {
                renderer: function (c) { return c.h(); },
            }
        });

        // execute
        renderer.update();

        // verify
        var vdom = this.apothecarius.getComponentData('no-parent-dom', 'vdom');
        expect(vdom.last).toBeFalsy();
    });

    it('removes references when being disposed', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.VDomRenderSystem').brew({
            delegator: alchemy('alchemy.web.Delegatus').brew(),
            entities: this.apothecarius
        });

        // execute
        testSubject.dispose();

        // verify
        expect(testSubject.entities).toBeFalsy();
        expect(testSubject.delegator).toBeFalsy();
    });

    function initRenderer() {
        alchemy.brew({
            name: 'FooRenderer',
            overrides: {
                render: jasmine.createSpy().andCallFake(function (context) {
                    return context.h('div#' + context.entityId, null, [
                        context.renderChild('bar'),
                        context.h('div.spacer'),
                        context.renderChild('baz'),
                        context.renderChild('unknown-entity'),
                    ]);
                })
            }
        });

        alchemy.brew({
            name: 'BarRenderer',
            overrides: {
                render: jasmine.createSpy().andCallFake(function (context) {
                    return context.h('div', {
                        id: context.entityId,
                        className: context.state.val('bla'),
                    }, context.renderAllChildren());
                })
            }
        });

        alchemy.brew({
            name: 'BazRenderer',
            overrides: {
                render: jasmine.createSpy().andCallFake(function (context) {
                    return context.h('div', {
                        id: context.entityId,
                        className: 'baz-class'
                    }, context.renderAllChildren());
                })
            }
        });
    }

    function initEntities(apothecarius) {
        apothecarius.createEntity({
            id: 'foo',
            vdom: {
                root: document.getElementById('sandbox'),
                renderer: 'FooRenderer'
            },
            children: {
                bar: 'bar',
                baz: 'baz',
            }
        });

        apothecarius.createEntity({
            id: 'bar',
            vdom: {
                renderer: 'BarRenderer'
            },
            children: {
                ping: 'ping',
                pong: 'pong',
                fail: 'unknown-entity',
            },
            state: {
                bla: 'bla',
            }
        });

        apothecarius.createEntity({
            id: 'baz',
            vdom: {
                renderer: 'BazRenderer'
            },
        });

        apothecarius.createEntity({
            id: 'ping',
            vdom: {
                renderer: 'BazRenderer'
            }
        });

        apothecarius.createEntity({
            id: 'pong',
            vdom: {
                renderer: function (context) {
                    return context.h('div#pong');
                },
            }
        });
    }
});
