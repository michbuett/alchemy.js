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
    });
});
