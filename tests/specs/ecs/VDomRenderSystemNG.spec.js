/* global $ */
describe('alchemy.ecs.vdom_ngRenderSystem (NG)', function () {
    'use strict';

    var VDomRenderSystem = require('./../../../lib/VDomRenderSystemNG');
    var h = require('virtual-dom/h');

    beforeEach(function () {
        setFixtures('<div id="foo"></div>');

        this.testSubject = VDomRenderSystem.brew();
    });

    it('renders the entities to the DOM', function () {
        var entities1 = new Map([
            ['foo', {
                vdom_ng: h('div.bar'),
            }]
        ]);
        var entities2 = new Map([
            ['foo', {
                vdom_ng: h('div.baz'),
            }]
        ]);

        this.testSubject.update(entities1);

        // verify #1
        expect($('div#foo.bar')).toExist();
        expect($('div#foo.baz')).not.toExist();

        // execute #2
        this.testSubject.update(entities2);

        // verify #2
        expect($('div#foo.bar')).not.toExist();
        expect($('div#foo.baz')).toExist();
    });

    it('allows to render all known child-entities', function () {
        // prepare
        var entities = new Map([
            ['foo', {
                vdom_ng: h('div', null, [
                    h('.left', h('#bar')),
                    h('.right')
                ]),

                children: [ 'bar' ],
            }],

            ['bar', {
                vdom_ng: h('#bar.boom', null, [h('#baz')]),
                children: [ 'baz'],
            }],

            ['baz', {
                vdom_ng: h('#baz.bang'),
            }],
        ]);

        // execute
        this.testSubject.update(entities);

        // verify
        expect($('#foo .left #bar.boom #baz.bang')).toExist();

        // execute #2 (change dom root of child entity)
        this.testSubject.update(entities.set('foo', {
            vdom_ng: h('div', null, [
                h('.left'),
                h('.right', h('#bar'))
            ]),

            children: [ 'bar' ],
        }));

        // verify #2
        expect($('#foo .right #bar.boom #baz.bang')).toExist();
    });

    it('skips entities which have no parent dom element', function () {
        // prepare
        var testSubject = this.testSubject;
        var entities = new Map([
            ['no-parent-dom', { vdom_ng: h('#no-parent-dom') }]
        ]);

        // execute
        expect(function () {
            testSubject.update(entities);

        // verify
        }).not.toThrow();
        expect($('#no-parent-dom')).not.toExist();
    });

    it('skips entities without vdom renderer', function () {
        // prepare
        var testSubject = this.testSubject;
        var entities = new Map([
            ['foo', { vdom_ng: null }]
        ]);

        // execute
        expect(function () {
            testSubject.update(entities);

        // verify
        }).not.toThrow();
    });

    it('removes caches when being disposed', function () {
        // prepare
        var entities = new Map([
            ['foo', { vdom_ng: h('div.bar') }]
        ]);

        this.testSubject.update(entities);
        expect(this.testSubject.lastTrees).toBeTruthy();
        expect(this.testSubject.domNodes).toBeTruthy();

        // execute
        this.testSubject.dispose();

        // verify
        expect(this.testSubject.lastTrees).toBeFalsy();
        expect(this.testSubject.domNodes).toBeFalsy();
    });
});
