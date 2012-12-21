/*
 * Copyright (C) 2012 Michael Büttner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * The Software shall not be used for discriminating or manipulating people.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function () {
    'use strict';

    var alchemy = require('./alchemy.js');

    /**
     * Description
     *
     * @class browser.Viewport
     * @extends MateriaPrima
     */
    alchemy.formula.add({
        name: 'arena.Viewport',
        extend: 'Oculus',
        overrides: {
            template: [
                '<div id="<$data.id$>" class="viewport">',
                '<div class="fps"></div>',
                '</div>'
            ].join(''),

            update: function (frame, app) {
                if (frame % 100 === 0) {
                    var fpsEl = document.querySelector('.viewport .fps');
                    if (fpsEl) {
                        fpsEl.innerHTML = 'FPS: ' + Math.round(app.fps());
                    }
                }
            },

            draw: function () {
                if (!this.rendered) {
                    this.render();
                }
            },

            render: function () {
                document.body.innerHTML = alchemy.render(this.template, {
                    id: this.id
                });
                this.rendered = true;
                return null;
            }
        }
    });
}());

