module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');
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
    var MateriaPrima = {
        /** @lends alchemy.core.MateriaPrima */

        /**
         * @constructs
         */
        constructor: function (cfg) {
            // apply configuration
            cfg = cfg || {};
            cfg.id = cfg.id || alchemy.id();
            alchemy.override(this, cfg);
        },

        /**
         * initializes the instance;
         * to be overridden
         * @function
         * @protected
         */
        init: function () {},

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
         * Creates a new instance of the current prototype; every parameter
         * will be passed to the respective constructor method
         *
         * @param {Object} cfg The configuration for the new instance
         * @return {Object} The new instance
         */
        brew: function (cfg) {
            // you are creating an intance of an intance; the constuctor-
            // prototype-handling is necessarry so the javascript interpreter
            // will treat the instance as if created with "new Constructor"
            // and will optimize the object
            var orgCtor = this.constructor;
            var Ctor = function (cfg) {
                orgCtor.call(this, cfg);
            };

            Ctor.prototype = this;

            var newObj = new Ctor(cfg);

            // add read-only references to the base type
            newObj.meta('prototype', this);
            newObj.dispose = dispose;

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
        finish: function () {},
    };

    function dispose() {
        /* jshint validthis: true */
        this.meta('prototype', null);
        this.finish();
        /* jshint validthis: false */
    }

    alchemy.formula.add({
        name: 'alchemy.core.MateriaPrima',
        alias: 'MateriaPrima',
        extend: Object.prototype,
        overrides: MateriaPrima,
    });

    return coquoVenenum(MateriaPrima).whenDisposed(dispose);
}());
