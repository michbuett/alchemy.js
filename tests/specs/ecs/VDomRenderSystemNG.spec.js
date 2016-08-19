/* global $ */
describe('alchemy.ecs.VDomRenderSystem (NG)', function () {
    'use strict';

    // var Apothecarius = require('./../../../lib/Apothecarius');
    var VDomRenderSystem = require('./../../../lib/VDomRenderSystemNG');
    var immutable = require('immutabilis');
    var h = require('virtual-dom/h');

    beforeEach(function () {
        setFixtures(sandbox());

        this.testSubject = VDomRenderSystem.brew();
    });

    it('renders the entities to the DOM', function () {
        var state = immutable.fromJS('bar');
        var entities = [{
            id: 'foo',
            vdom: {
                root: document.getElementById('sandbox'),
                renderer: function (state) {
                    return h('div.' + state.val());
                },
            }
        }];

        this.testSubject.update(entities, state);

        // verify #1
        expect($('div#foo.bar')).toExist();
        expect($('div#foo.baz')).not.toExist();

        // second update (no state change)
        // execute #2
        this.testSubject.update(entities, state);

        // verify #2
        expect($('div#foo.bar')).toExist();
        expect($('div#foo.baz')).not.toExist();

        // third update (state change)
        // execute #3
        this.testSubject.update(entities, immutable.fromJS('baz'));

        // verify #3
        expect($('div#foo.bar')).not.toExist();
        expect($('div#foo.baz')).toExist();
    });


    it('allows to render all known child-entities', function () {
        // prepare
        var renderChildren = function (entity) {
            if (entity && Array.isArray(entity.children)) {
                return entity.children.map(function (childId) {
                    return h('div#' + childId);
                });
            }
            return [];
        };

        var renderer = function (state, entity) {
            return h('div', renderChildren(entity));
        };

        var entities = [{
            id: 'foo',
            vdom: {
                root: document.getElementById('sandbox'),
                renderer: renderer,
            },
            children: [ 'bar', 'baz'],
        }, {
            id: 'bar',
            vdom: { renderer: renderer, },
        }, {
            id: 'baz',
            vdom: { renderer: renderer, },
            children: [ 'ping', 'pong'],
        }, {
            id: 'ping',
            vdom: { renderer: renderer, },
        }, {
            id: 'pong',
            vdom: { renderer: renderer, },
        }];

        // execute
        this.testSubject.update(entities, immutable.fromJS());

        // verify
        expect($('#foo #bar')).toExist();
    //     expect($('#foo #baz #ping')).toExist();
    //     expect($('#foo #baz #pong')).toExist();
    });

    // it('allows to map the application state', function () {
    //     // prepare
    //     var state = immutable.fromJS({
    //         foo: 'bar'
    //     });

    //     this.apothecarius.createEntity({
    //         id: 'foo',
    //         vdom: {
    //             root: document.getElementById('sandbox'),
    //             renderer: function (ctxt) {
    //                 return ctxt.h('div', {
    //                     className: ctxt.state.val(),
    //                 });
    //             },
    //             stateMap: function (appState) {
    //                 return appState.sub('foo');
    //             },
    //         }
    //     });

    //     // execute #1
    //     this.testSubject.update(state);

    //     // verify #1
    //     expect($('div#foo.bar')).toExist();
    //     expect($('div#foo.baz')).not.toExist();

    //     // second update (no state change)
    //     // execute #2
    //     this.testSubject.update(state);

    //     // verify #2
    //     expect($('div#foo.bar')).toExist();
    //     expect($('div#foo.baz')).not.toExist();

    //     // third update (state change)
    //     // execute #3
    //     this.testSubject.update(state.set('foo', 'baz'));

    //     // verify #3
    //     expect($('div#foo.bar')).not.toExist();
    //     expect($('div#foo.baz')).toExist();

    // });

    // it('skips entities which have no parent dom element', function () {
    //     // prepare
    //     var renderer = jasmine.createSpy('renderer');

    //     this.apothecarius.createEntity({
    //         id: 'no-parent-dom',
    //         vdom: {
    //             renderer: renderer,
    //         }
    //     });

    //     // execute
    //     this.testSubject.update(immutable.fromJS());

    //     // verify
    //     expect(renderer).not.toHaveBeenCalled();
    // });

    // it('removes references when being disposed', function () {
    //     // prepare

    //     // execute
    //     this.testSubject.dispose();

    //     // verify
    //     expect(this.testSubject.entities).toBeFalsy();
    // });
});
