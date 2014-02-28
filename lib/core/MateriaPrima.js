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
             *
             */
            // addIngredient: function (key, ingredient) {
            //     var ingredients = this.meta('ingredients') || {};
            //     if (alchemy.isString(ingredient)) {
            //         ingredient = alchemy(ingredient);
            //     }
            //     // register the new ingredient in the ingredients cache
            //     ingredients[key] = ingredient;
            //     // add the public functions and properties to the current type
            //     ingredient.addActiveSubstances(this, key);
            //     // write back cache
            //     this.meta('ingredients', ingredients);
            // },

            /**
             * Enhances the current prototype with a new ingredient (mixin)
             * @function
             *
             * @param {String} key The key to identify the ingredient
             * @param {Object} ingredient The ingredient prototype to be added
             * @return {Object} The current potion for chaining
             */
            addIngredient: (function () {
                // helper function to create a method which delegate the call to
                // the ingredient
                var createFunctionDelegate = function (delegateKey, fnKey) {
                    return function () {
                        var ingredients = this.meta('ingredients');
                        var delegate = ingredients[delegateKey].delegate;
                        return delegate[fnKey].apply(delegate, arguments);
                    };
                };

                // helper method to create a property description which allows to
                // modify the property of the ingredient delegate in the same way
                // it would modify the potion itself
                var createPropertyDelegate = function (delegateKey, propKey) {
                    return {
                        get: function () {
                            var ingredients = this.meta('ingredients');
                            var delegate = ingredients[delegateKey].delegate;
                            return delegate[propKey];
                        },

                        set: function (val) {
                            var ingredients = this.meta('ingredients');
                            var delegate = ingredients[delegateKey].delegate;
                            delegate[propKey] = val;
                        },
                    };
                };

                return function (key, cfg) {
                    if (cfg && !cfg.potion) {
                        // allow shortcut
                        cfg = {
                            potion: cfg
                        };
                    }

                    var potion = alchemy.isString(cfg.potion) ? alchemy(cfg.potion) : cfg.potion;
                    if (!alchemy.isObject(potion)) {
                        // no valid ingredient/name passed -> exit
                        return this;
                    }

                    var ingredients = alchemy.mix({}, this.meta('ingredients'));
                    var init = cfg.init !== false;
                    var delegate = cfg.delegate;
                    var publics = cfg.publics || potion.publics || Object.keys(potion);

                    // register the new ingredient in the ingredients cache
                    ingredients[key] = {
                        potion: potion,
                        delegate: delegate
                    };

                    if (delegate) {
                        alchemy.each(publics, function (itemKey) {
                            if (alchemy.isFunction(potion[itemKey])) {
                                this[itemKey] = createFunctionDelegate(key, itemKey);
                            } else {
                                alchemy.defineProperty(this, itemKey, createPropertyDelegate(key, itemKey));
                            }
                        }, this);

                        if (init) {
                            ingredients[key].delegate = potion.brew();
                        }

                    } else {
                        alchemy.each(publics, function (itemKey) {
                            this[itemKey] = potion[itemKey];
                        }, this);

                        if (init && alchemy.isFunction(potion.init)) {
                            potion.init.call(this);
                        }
                    }

                    //  and write it back
                    this.meta('ingredients', ingredients);
                    return this;
                };
            }()),

            /**
             * Creates a new instance of the current prototype; every parameter
             * will be passed to the respective constructor method
             *
             * @param {Object} cfg The configuration for the new instance
             * @return {Object} The new instance
             */
            brew: function (cfg) {
                var newObj;
                var ingredients = this.meta('ingredients');
                var newIngredients;
                var Ctor;

                if (this === this.constructor.prototype) {
                    // you are creating an instance of the potion prototype (this
                    // should be true in most cases)
                    Ctor = this.constructor;
                } else {
                    // you are creating an intance of an intance; the constuctor-
                    // prototype-handling is necessarry so the javascript interpreter
                    // will treat the instance as if created with "new Constructor"
                    // and will optimize the object
                    var orgCtor = this.constructor;
                    this.constructor = function (cfg) {
                        orgCtor.call(this, cfg);
                    };
                    this.constructor.prototype = this;
                    Ctor = this.constructor;
                }
                newObj = new Ctor(cfg);

                // add read-only references to the base type
                newObj.meta('prototype', this);

                if (ingredients) {
                    newIngredients = {};
                    alchemy.each(ingredients, function (ingr, key) {
                        var ingrCfg = cfg && (cfg[key] || cfg);
                        var potion = ingr.potion;

                        newIngredients[key] = {
                            potion: potion
                        };

                        if (ingr.delegate) {
                            // create new delegate instance to avoid conflicts
                            newIngredients[key].delegate = ingr.potion.brew(ingrCfg);
                        } else if (alchemy.isFunction(potion.init)) {
                            // init simple mixin
                            potion.init.call(this);
                        }
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
                // helper method to clean a single ingredient
                var disposeIngredient = function (ingr) {
                    if (alchemy.isObject(ingr.delegate)) {
                        if (alchemy.isFunction(ingr.delegate.dispose)) {
                            ingr.delegate.dispose();
                        }
                        ingr.delegate = null;
                    } else if (alchemy.isFunction(ingr.potion.finish)) {
                        // clean up for generic ingrediendts
                        ingr.potion.finish.call(this);
                    }
                    ingr.potion = null;
                };

                return function () {
                    // clean up ingredients
                    var ingredients = this.meta('ingredients');
                    if (ingredients) {
                        alchemy.each(ingredients, disposeIngredient, this);
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
