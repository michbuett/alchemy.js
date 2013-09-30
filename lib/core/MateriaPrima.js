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
                alchemy.extend(this, cfg);
            },

            /**
             * initializes the instance;
             * to be overridden
             * @function
             * @protected
             */
            init: alchemy.emptyFn,

            /**
             * Reads and writes the value of a meta attribute
             *
             * @param {String} key The identifier of the attribute
             * @param {Mixed} value Optional; The new value; If ommitted the value will not be changed
             * @return {Mixed} The current value of the meta attributes
             */
            meta: function (key, value) {
                return alchemy.meta(this, key, value);
            },

            /**
             * Enhances the current prototype with a new ingredient (mixin)
             *
             * @param {String} key The key to identify the ingredient
             * @param {Object} ingredient The ingredient prototype to be added
             */
            addIngredient: function (key, ingredient) {
                var ingredients = this.meta('ingredients') || {};
                if (alchemy.isString(ingredient)) {
                    ingredient = alchemy(ingredient);
                }
                // register the new ingredient in the ingredients cache
                ingredients[key] = ingredient;
                // add the public functions and properties to the current type
                ingredient.addActiveSubstances(this, key);
                // write back cache
                this.meta('ingredients', ingredients);
            },

            /**
             * Creates a new instance of the current prototype; every parameter
             * will be passed to the respective constructor method
             *
             * @param {Object} cfg The configuration for the new instance
             * @return {Object} The new instance
             */
            brew: function (cfg) {
                var Ctor = this.constructor;
                var newObj;
                var ingredients = this.meta('ingredients');
                var newIngredients;

                // add read-only references to the base type
                Ctor.prototype = this;
                newObj = new Ctor(cfg);
                newObj.meta('prototype', this);

                if (ingredients) {
                    newIngredients = {};
                    // create new instances of each ingredient to avoid conflicts
                    alchemy.each(ingredients, function (ingr, key) {
                        var ingrCfg = cfg && (cfg[key] || cfg);
                        newIngredients[key] = ingr.brew(ingrCfg);
                    }, this);
                    // register the new set of ingredients
                    newObj.meta('ingredients', newIngredients);
                }

                // call constructor function to initialize new instance
                newObj.init();
                return newObj;
            },

            /**
             * An anbstract cleanup method for overriding;
             * Called when a disposing the potion
             * @function
             * @protected
             * @see alchemy.core.MateriaPrima#dispose
             */
            finish: alchemy.emptyFn,

            /**
             * The potion destructor; It cleans all references the potion has to other objects
             * NOTITCE:
             * - In general the instance is not usable anymore after beeing disposed
             * - Do not for get to cut all references to the potion itself so garbage
             *   collector can do its work
             * - It is recommended to override {@link finish} to do custom clean up
             * @function
             * @see alchemy.core.MateriaPrima#finish
             */
            dispose: (function () {
                var disposeIngredient = function (ingr) {
                    ingr.dispose();
                };
                return function () {
                    // clean up ingredients
                    var ingredients = this.meta('ingredients');
                    if (ingredients) {
                        alchemy.each(ingredients, disposeIngredient);
                        this.meta('ingredients', null);
                    }
                    // cut reference to prototype
                    this.meta('prototype', null);
                    // call method for custom clean up
                    this.finish();
                };
            }()),
        }
    });
}());
