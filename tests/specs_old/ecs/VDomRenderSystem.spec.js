/* global $ */
describe('alchemy.ecs.VDomRenderSystem', function () {
    'use strict';

    var Apothecarius = require('./../../../old/Apothecarius');
    var VDomRenderSystem = require('./../../../old/VDomRenderSystem');
    var immutable = require('immutabilis');

    beforeEach(function () {
        setFixtures(sandbox());

        this.apothecarius = Apothecarius.brew();

        this.testSubject = VDomRenderSystem.brew({
            entities: this.apothecarius,
        });
    });

    it('renders the entities to the DOM', function () {
        // prepare
        var state = immutable.fromJS('bar');

        this.apothecarius.createEntity({
            id: 'foo',
            vdom: {
                root: document.getElementById('sandbox'),
                renderer: function (ctxt) {
                    return ctxt.h('div.' + ctxt.state.val());
                },
            }
        });

        // execute #1
        this.testSubject.update(state);

        // verify #1
        expect($('div#foo.bar')).toExist();
        expect($('div#foo.baz')).not.toExist();

        // second update (no state change)
        // execute #2
        this.testSubject.update(state);

        // verify #2
        expect($('div#foo.bar')).toExist();
        expect($('div#foo.baz')).not.toExist();

        // third update (state change)
        // execute #3
        this.testSubject.update(immutable.fromJS('baz'));

        // verify #3
        expect($('div#foo.bar')).not.toExist();
        expect($('div#foo.baz')).toExist();

    });

    it('allows to render all known child-entities', function () {
        // prepare
        var renderer = function (ctxt) {
            return ctxt.h('div', null, ctxt.renderAllChildren());
        };

        this.apothecarius.createEntity({
            id: 'foo',
            vdom: {
                root: document.getElementById('sandbox'),
                renderer: renderer,
            },
            children: [ 'bar', 'baz'],
        });

        this.apothecarius.createEntity({
            id: 'bar',
            vdom: { renderer: renderer, },
        });

        this.apothecarius.createEntity({
            id: 'baz',
            vdom: { renderer: renderer, },
            children: [ 'ping', 'pong'],
        });

        this.apothecarius.createEntity({
            id: 'ping',
            vdom: { renderer: renderer, },
        });

        this.apothecarius.createEntity({
            id: 'pong',
            vdom: { renderer: renderer, },
        });

        // execute
        this.testSubject.update(immutable.fromJS());

        // verify
        expect($('#foo #bar')).toExist();
        expect($('#foo #baz #ping')).toExist();
        expect($('#foo #baz #pong')).toExist();
    });

    it('allows to map the application state', function () {
        // prepare
        var state = immutable.fromJS({
            foo: 'bar'
        });

        this.apothecarius.createEntity({
            id: 'foo',
            vdom: {
                root: document.getElementById('sandbox'),
                renderer: function (ctxt) {
                    return ctxt.h('div', {
                        className: ctxt.state.val(),
                    });
                },
                stateMap: function (appState) {
                    return appState.sub('foo');
                },
            }
        });

        // execute #1
        this.testSubject.update(state);

        // verify #1
        expect($('div#foo.bar')).toExist();
        expect($('div#foo.baz')).not.toExist();

        // second update (no state change)
        // execute #2
        this.testSubject.update(state);

        // verify #2
        expect($('div#foo.bar')).toExist();
        expect($('div#foo.baz')).not.toExist();

        // third update (state change)
        // execute #3
        this.testSubject.update(state.set('foo', 'baz'));

        // verify #3
        expect($('div#foo.bar')).not.toExist();
        expect($('div#foo.baz')).toExist();

    });

    it('skips entities which have no parent dom element', function () {
        // prepare
        var renderer = jasmine.createSpy('renderer');

        this.apothecarius.createEntity({
            id: 'no-parent-dom',
            vdom: {
                renderer: renderer,
            }
        });

        // execute
        this.testSubject.update(immutable.fromJS());

        // verify
        expect(renderer).not.toHaveBeenCalled();
    });

    it('removes references when being disposed', function () {
        // prepare

        // execute
        this.testSubject.dispose();

        // verify
        expect(this.testSubject.entities).toBeFalsy();
    });
});
