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

    var alchemy = require('./Alchemy.js');

    /**
     * An ingredient can be added to any base when brewing new potions to provide additional effects.
     * The ingredients act as mixins. To make any base mixable just mix the Ingredient in.
     *
     * @class Ingredient
     * @extends MateriaPrima
     */
    alchemy.formula.add({
        name: 'Ingredient',
        extend: 'MateriaPrima',
        overrides: {
            publics: undefined,

            /**
             * Creates a function for the host object which will delegate the call to the ingredient
             * @private
             */
            createFunctionDelegate: function (typeKey, fnKey) {
                var fn;
                /*jslint evil: true*/
                eval([
                    'fn = function (a, b, c, d, e) {',
                    '    var ingredients = this.getMetaAttr("ingredients"),',
                    '        delegate = ingredients.', typeKey, ';',
                    '    return delegate.' + fnKey + '(a, b, c, d, e);',
                    '};'
                ].join(''));
                /*jslint evil: false*/
                return fn;
            },

            /**
             * Defines a property for the host object which will access the property of the ingredient
             * @private
             */
            createPropertyDelegate: function (typeKey, key) {
                var getter,
                    setter;

                /*jslint evil: true*/
                eval([
                    'getter = function () {',
                    '    var ingredients = this.getMetaAttr("ingredients"),',
                    '        delegate = ingredients.', typeKey, ';',
                    '    return delegate.', key, ';',
                    '};',
                    'setter = function (value) {',
                    '    var ingredients = this.getMetaAttr("ingredients"),',
                    '        delegate = ingredients.', typeKey, ';',
                    '    return delegate.', key, ' = value;',
                    '};'
                ].join(''));
                /*jslint evil: false*/
                return {
                    get: getter,
                    set: setter
                };
            },

            /**
             * Adds the public parts of the ingredient (mixin) to the host object. In fact it creates delegates which
             * will access the actual ingredient functions and properties
             * NOTICE: the method uses the ecma script 5 feature Object.defineProperty to create property-delegates!
             *
             * @param {Object} base
             *      the host object
             *
             * @param {String} typeKey
             *      the key to identify the ingredient in the host
             */
            addActiveSubstances: function (base, typeKey) {
                var i;
                var key;
                var overrides = {};

                // travers through publics and create delegates
                for (i = 0; i < this.publics.length; i++) {
                    key = this.publics[i];
                    if (alchemy.isFunction(this[key])) {
                        overrides[key] = this.createFunctionDelegate(typeKey, key);
                    } else {
                        alchemy.defineProperty(base, key, this.createPropertyDelegate(typeKey, key));
                    }
                }
                // apply mixed in methods
                alchemy.override(base, overrides);
            }
        }
    });
}());

