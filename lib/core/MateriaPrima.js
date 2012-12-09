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
     * @class MateriaPrima
     * @extends Object
     */
    alchemy.formula.add({
        name: 'MateriaPrima',
        extend: Object.prototype,
        overrides: {
            /**
             * @constructor
             * @memberOf alchemy.MateriaPrima
             */
            constructor: function (cfg) {
                // apply configuration
                cfg = cfg || {};
                cfg.id = cfg.id || alchemy.id();
                alchemy.override(this, cfg);

                // initialize object
                this.init();
            },

            /**
             * initializes the instance;
             * to be overridden
             */
            init: alchemy.emptyFn,

            /**
             * Returns the value of a meta attribute
             *
             * @param {String} key
             *      the identifier of the attribute
             */
            getMetaAttr: function (key) {
                return this[alchemy.metaPrefix + key];
            },

            /**
             * Sets the value of a meta attribute
             *
             * @param {String} key
             *      the identifier of the attribute
             *
             * @param {Mixes} value
             *      the new value
             *
             * @return {Object}
             *      returns the current object for chaining
             */
            setMetaAttr: function (key, value) {
                this[alchemy.metaPrefix + key] = value;
                return this;
            },

            /**
             * Enhances the current prototype with a new ingredient (mixin)
             *
             * @param {String} key
             *      the key to identify the ingredient
             *
             * @param {Object} ingredient
             *      the ingredient prototype to be added
             */
            addIngredient: function (key, ingredient) {
                var ingredients = this.getMetaAttr('ingredients') || {};
                // register the new ingredient in the ingredients cache
                ingredients[key] = ingredient;
                // add the public functions and properties to the current type
                ingredient.addActiveSubstances(this, key);
                // write back cache
                this.setMetaAttr('ingredients', ingredients);
            },

            /**
             * creates a new instance of the current prototype; every parameter
             * will be passed to the respective constructor method
             *
             * @return {Object}
             *      the new instance
             */
            create: function () {
                var newObj = Object.create(this),
                ingredients = this.getMetaAttr('ingredients'),
                newIngredients;

                // add read-only references to the base type
                newObj.setMetaAttr('basetype', this);

                if (ingredients) {
                    newIngredients = {};
                    // create new instances of each ingredient to avoid conflicts
                    alchemy.each(ingredients, function (ingr, key) {
                        newIngredients[key] = ingr.create();
                    }, this);
                    // register the new set of ingredients
                    newObj.setMetaAttr('ingredients', newIngredients);
                }

                // call constructor function to initialize new instance
                newObj.constructor.apply(newObj, arguments);
                return newObj;
            },

            /**
             * an anbstract cleanup method;
             * in general the instance is not usable anymore after beeing disposed
             */
            dispose: alchemy.emptyFn
        }
    });
}());
