(function () {
    'use strict';

    var alchemy = require('./Alchemy.js');

    /**
     * The base of every potion. It provides:
     * - a convenient constructor method that applies given properties automatically
     * - a method to create intances of a potion (see {@link #brew})
     * - a way to read and write meta attributes
     * - the possibility to add ingredients
     *
     * @class
     * @name alchemy.core.MateriaPrima
     * @extends Object
     * @alias MateriaPrima
     */
    alchemy.formula.add({
        name: 'alchemy.core.MateriaPrima',
        alias: 'MateriaPrima',
        extend: Object.prototype,
        overrides: {
            /** @lends alchemy.core.MateriaPrima */

            /**
             * @constructs
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
             *
             * @methodOf alchemy.core.MateriaPrima
             */
            init: alchemy.emptyFn,

            /**
             * Returns the value of a meta attribute
             *
             * @param {String} key
             *      the identifier of the attribute
             *
             * @methodOf alchemy.core.MateriaPrima
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
                if (alchemy.isString(ingredient)) {
                    ingredient = alchemy(ingredient);
                }
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
            brew: function () {
                var newObj = Object.create(this),
                ingredients = this.getMetaAttr('ingredients'),
                newIngredients;

                // add read-only references to the base type
                newObj.setMetaAttr('basetype', this);

                if (ingredients) {
                    newIngredients = {};
                    // create new instances of each ingredient to avoid conflicts
                    alchemy.each(ingredients, function (ingr, key) {
                        newIngredients[key] = ingr.brew();
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
             *
             * @methodOf alchemy.core.MateriaPrima
             */
            dispose: alchemy.emptyFn
        }
    });
}());
