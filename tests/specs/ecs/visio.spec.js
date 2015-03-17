/* global $ */
describe('alchemy.web.Visio', function () {
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
        var renderer = alchemy('alchemy.ecs.Visio').brew({
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
        var renderer = alchemy('alchemy.ecs.Visio').brew({
            entities: this.apothecarius
        });
        renderer.update();
        var barState = this.apothecarius.getComponent('bar', 'state');

        // execute
        barState.last = barState.current;
        barState.current = barState.current.set('bla', 'blub');
        renderer.update();

        // verify
        expect($('div#foo div#bar.blub')).toExist();
        expect($('div#foo div#bar.blub div#ping')).toExist();
        expect($('div#foo div#bar.blub div#pong')).toExist();
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
            dom: {
                root: document.getElementById('sandbox'),
                renderer: 'FooRenderer'
            },
            children: {
                current: alchemy('Immutatio').makeImmutable(['bar', 'baz'])
            }
        });

        apothecarius.createEntity({
            id: 'bar',
            dom: {
                renderer: 'BarRenderer'
            },
            children: {
                current: alchemy('Immutatio').makeImmutable(['ping', 'pong'])
            },
            state: {
                current: alchemy('Immutatio').makeImmutable({'bla': 'bla'}),
                last: null,
            }
        });

        apothecarius.createEntity({
            id: 'baz',
            dom: {
                renderer: 'BazRenderer'
            },
        });

        apothecarius.createEntity({
            id: 'ping',
            dom: {
                renderer: 'BazRenderer'
            }
        });

        apothecarius.createEntity({
            id: 'pong',
            dom: {
                renderer: 'BazRenderer'
            }
        });
    }
});
