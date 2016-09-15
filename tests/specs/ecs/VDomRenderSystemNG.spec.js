/* global $ */
describe('alchemy.ecs.vdom_ngRenderSystem (NG)', function () {
    'use strict';

    var VDomRenderSystem = require('./../../../lib/VDomRenderSystemNG');
    var immutable = require('immutabilis');
    var h = require('virtual-dom/h');

    beforeEach(function () {
        setFixtures('<div id="foo"></div>');

        this.testSubject = VDomRenderSystem.brew();
    });

    it('renders the entities to the DOM', function () {
        var state = immutable.fromJS('bar');
        var entities = {
            foo: {
                vdom_ng: function (state) {
                    return h('div.' + state.val());
                }
            }
        };

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

        var entities = {
            'bang': {
                vdom_ng: renderer,
                children: [ 'boom', ],
                parent: 'ping',
            },
            'foo': {
                vdom_ng: renderer,
                children: [ 'bar', 'baz'],
            },
            'bar': {
                vdom_ng: renderer,
                parent: 'foo',
            },
            'baz': {
                vdom_ng: renderer,
                children: [ 'ping', 'pong'],
                parent: 'foo',
            },
            'ping': {
                vdom_ng: renderer,
                children: [ 'bang'],
                parent: 'baz',
            },
            'pong': {
                vdom_ng: renderer,
                parent: 'baz',
            }
        };

        // execute
        this.testSubject.update(entities, immutable.fromJS());

        // verify
        expect($('#foo #bar')).toExist();
        expect($('#foo #baz #ping')).toExist();
        expect($('#foo #baz #pong')).toExist();
        expect($('#foo #baz #ping #bang #boom')).toExist();
    });

    it('skips entities which have no parent dom element', function () {
        // prepare
        var renderer = jasmine.createSpy('renderer');
        var entities = {
            'no-parent-dom': {
                vdom_ng: renderer,
            }
        };

        // execute
        this.testSubject.update(entities, immutable.fromJS());

        // verify
        expect(renderer).not.toHaveBeenCalled();
    });

    it('skips entities without vdom renderer', function () {
        // prepare
        var testSubject = this.testSubject;
        var entities = {
            'foo': {
                vdom_ng: null,
            }
        };

        // execute
        expect(function () {
            testSubject.update(entities, immutable.fromJS());

        // verify
        }).not.toThrow();
    });

    it('removes caches when being disposed', function () {
        // prepare
        var entities = {
            'foo': {
                vdom_ng: function () { return h('div#foo.bar'); },
            }
        };

        this.testSubject.update(entities, immutable.fromJS());
        expect(this.testSubject.lastTrees).toBeTruthy();
        expect(this.testSubject.domNodes).toBeTruthy();

        // execute
        this.testSubject.dispose();

        // verify
        expect(this.testSubject.lastTrees).toBeFalsy();
        expect(this.testSubject.domNodes).toBeFalsy();
    });
});
