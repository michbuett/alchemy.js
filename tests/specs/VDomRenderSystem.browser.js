/* global $ */
describe('alchemy.lib.VDomRenderSystem', function () {
    'use strict';

    var VDomRenderSystem = require('./../../lib/VDomRenderSystem');
    var h = require('virtual-dom/h');

    beforeEach(function () {
        setFixtures('<div id="foo"></div>');

        this.testSubject = VDomRenderSystem.brew();
    });

    it('renders the entities to the DOM', function () {
        var entities1 = [{
            id: 'foo',
            vdom: h('div.bar'),
        }];
        var entities2 = [{
            id: 'foo',
            vdom: h('div.baz'),
        }];

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
        var entities = [{
            id: 'foo',
            vdom: h('div', null, [
                h('.left', h('#bar')),
                h('.right')
            ]),

            children: [{ id: 'bar', }],
        }, {
            id: 'bar',
            vdom: h('#bar.boom', null, [h('#baz')]),
            children: [{ id: 'baz', }],
        }, {
            id: 'baz',
            vdom: h('#baz.bang'),
        }];

        // execute
        this.testSubject.update(entities);

        // verify
        expect($('#foo .left #bar.boom #baz.bang')).toExist();
    });

    it('allows to change child-entities root', function () {
        // prepare
        var entities = [{
            id: 'foo',
            vdom: h('div', null, [
                h('.left', h('#bar')),
                h('.right')
            ]),

            children: [{ id: 'bar', }],
        }, {
            id: 'bar',
            vdom: h('#bar.boom', null, [h('#baz')]),
            children: [{ id: 'baz', }],
        }, {
            id: 'baz',
            vdom: h('#baz.bang'),
        }];

        // execute
        // rendering #1
        this.testSubject.update(entities);
        this.testSubject.update(entities);
        // rendering #2 (change dom root of child entity)
        entities[0] = {
            id: 'foo',
            vdom: h('div', null, [
                h('.left'),
                h('.right', h('#bar'))
            ]),
            children: [{ id: 'bar' }],
        };
        this.testSubject.update(entities);

        // verify
        expect($('#foo .right #bar.boom #baz.bang')).toExist();
    });

    it('parses the current DOM when changing child-entities root', function () {
        // prepare
        var entities = [{
            id: 'foo',
            vdom: h('div', null, [
                h('.left', h('#bar')),
                h('.right')
            ]),

            children: [{ id: 'bar', }],
        }, {
            id: 'bar',
            vdom: h('#bar.boom', null, [
                h('span.label', 'Some button: '),
                h('input.field', { type: 'button', })
            ]),
        }];

        // execute
        // rendering #1
        this.testSubject.update(entities);
        // rendering #2 (change dom root of child entity)
        entities[0] = {
            id: 'foo',
            vdom: h('div', null, [
                h('.left'),
                h('.right', h('#bar', null, [
                    h('span', 'Some button: '),
                    h('input.field', { type: 'button', })
                ]))
            ]),
            children: [{ id: 'bar' }],
        };
        this.testSubject.update(entities);

        // verify
        expect($('#foo .right #bar.boom span.label')).toExist();
        expect($('#foo .right #bar.boom input.field')).toExist();
    });

    it('skips entities which have no parent dom element', function () {
        // prepare
        var testSubject = this.testSubject;
        var entities = [{
            id: 'no-parent-dom',
            vdom: h('#no-parent-dom')
        }];

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
        var entities = [{ vdom: null }];

        // execute
        expect(function () {
            testSubject.update(entities);

        // verify
        }).not.toThrow();
    });

    it('removes caches when being disposed', function () {
        // prepare
        var entities = [{ id: 'foo', vdom: h('div.bar') }];

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
