/* global $ */
describe('alchemy.web.Visio', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        setFixtures(sandbox());
        this.sandboxEl = document.getElementById('sandbox');
    });

    describe('draw', function () {
        it('allows to draw DOM elements', function () {
            // prepare
            var visio = alchemy('alchemy.web.Visio').brew({
                root: this.sandboxEl,
                render: function () {
                    return this.h('div', [this.h('div#foo'), this.h('div#bar')]);
                }
            });

            // execute
            visio.draw();

            // verify
            expect(this.sandboxEl).toContainElement('div#foo');
            expect(this.sandboxEl).toContainElement('div#bar');
        });

        it('support sub components', function () {
            // prepare
            var visio = alchemy('alchemy.web.Visio').brew({
                root: this.sandboxEl,
                subs: [
                    alchemy('alchemy.web.Visio').brew({id: 'foo'}),
                    alchemy('alchemy.web.Visio').brew({id: 'bar'}),
                ]
            });

            // execute
            visio.draw();

            // verify
            expect(this.sandboxEl).toContainElement('div#foo');
            expect(this.sandboxEl).toContainElement('div#bar');
        });

        it('delegates drawing to sub components if state has not changed', function () {
            // prepare
            var visio = alchemy('alchemy.web.Visio').brew({
                root: this.sandboxEl,
                subs: [
                    alchemy('alchemy.web.Visio').brew({
                        id: 'foo',
                        render: function () {
                            return this.h('div#' + this.id, null, this.state.foo);
                        }
                    }),
                ],
                updateState: function (state) {
                    return this.state || state;
                }
            });
            var state1 = { foo: 'bar' };
            var state2 = { foo: 'baz' };
            visio.draw(state1);
            var htmlBefore = this.sandboxEl.innerHTML;

            // execute
            visio.draw(state2);
            var htmlAfter = this.sandboxEl.innerHTML;

            // verify
            expect(htmlBefore).toBe('<div id="foo">bar</div>');
            expect(htmlAfter).toBe('<div id="foo">baz</div>');
        });

        it('allows to delegate dom events', function () {
            // prepare
            var handleClickFoo = jasmine.createSpy();
            var handleClickBar = jasmine.createSpy();
            var handleClickBaz = jasmine.createSpy();
            var visio = alchemy('alchemy.web.Visio').brew({
                root: this.sandboxEl,
                render: function () {
                    return this.h('div#foo', null, [
                        this.h('div#bar'),
                        this.h('div#baz'),
                    ]);
                },

                events: {
                    'click': 'handleClickFoo',
                    'click #bar': 'handleClickBar',
                },

                handleClickFoo: handleClickFoo,
                handleClickBar: handleClickBar,
                handleClickBaz: handleClickBaz,

                delegator: alchemy('alchemy.web.Delegatus').brew({
                    root: document.body,
                })
            });
            visio.draw();

            // execute
            $('#foo').click();
            $('#bar').click();

            // verify
            expect(handleClickFoo).toHaveBeenCalled();
            expect(handleClickBar).toHaveBeenCalled();
            expect(handleClickBaz).not.toHaveBeenCalled();
        });
    });
});
