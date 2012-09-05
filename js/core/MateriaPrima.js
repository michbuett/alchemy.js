/**
 * @class Alchemy.MateriaPrima
 * @extends Object
 */
/*global Alchemy*/
Alchemy.MateriaPrima = {
    /**
     * @constructor
     * @memberOf Alchemy.MateriaPrima
     */
    constructor: function (cfg) {
        // apply configuration
        cfg = cfg || {};
        cfg.id = cfg.id || Alchemy.id();
        Alchemy.mix(this, cfg);

        // initialize object
        this.init();
    },

    /**
     * initializes the instance;
     * to be overridden
     */
    init: Alchemy.emptyFn,

    /**
     * Returns the value of a meta attribute
     *
     * @param {String} key
     *      the identifier of the attribute
     */
    getMetaAttr: function (key) {
        return this[Alchemy.metaPrefix + key];
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
        this[Alchemy.metaPrefix + key] = value;
        return this;
    },

    /**
     * adds a new method to the prototype; if the <code>type[key]</code> is already
     * defined then this method will be overwridden and is accessable through the
     * <code>superCall</code> method
     *
     * @param {String} key
     *      the key of the object property
     *
     * @param {Function} fn
     *      the function to be added
     */
    addMethod: function (key, fn) {
        //console.log('addMethod', this._AJS_name, key)
        var pre = Alchemy.metaPrefix,
            superStack;

        if (fn[pre + 'owner']) {
            fn = Alchemy.cloneFn(fn);
        }
        if (Alchemy.isFunction(this[key])) {
            // add reference to super method
            superStack = this[key][pre + 'super'] || [];
            superStack.push(this[key]);
            // inject local variable "_super" that stores the reference to the super method
            fn = Alchemy.infect(fn, [
                'var _super = this.', key, '.', pre, 'super[', (superStack.length - 1), '];'
            ].join(''));
            // store stack of super methods
            fn[pre + 'super'] = superStack;
        }
        fn[pre + 'name'] = key;
        fn[pre + 'owner'] = this;
        this[key] = fn;
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
            Alchemy.each(ingredients, function (ingr, key) {
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
    dispose: Alchemy.emptyFn
};

Alchemy.MateriaPrima = Alchemy.brew({
    name: 'MateriaPrima',
    ns: 'Alchemy',
    extend: Object.prototype
}, Alchemy.MateriaPrima);
