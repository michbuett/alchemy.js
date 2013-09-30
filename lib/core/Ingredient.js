(function () {
    'use strict';

    var alchemy = require('./Alchemy.js');

    /**
     * An ingredient can be added to any base when brewing new potions to provide additional effects.
     * The ingredients act as mixins. To make any base mixable just mix the Ingredient in.
     *
     * NOTICE: Due to the delegate mechanism are the inherited methods generally faster than
     *         mixed-in methods. Here is a test for the method "on":
     *
     * <pre><code>
     *  var alchemy = require('alchemy');
     *  var m = alchemy('alchemy.core.Modelum'); // inherites "on"
     *  var c = alchemy('alchemy.core.Collectum'); // mixed-in "on"
     *  var testOn = function (objs, n) {
     *      for (var j = 0; j < objs.length; j++) {
     *          var obj = objs[j],
     *              key = n + ' x ' + obj.meta('name') + '.on',
     *              e = 'event',
     *              h = function() {};
     *              s = {};
     *
     *          console.time(key);
     *          for (var i = 0; i < n; i++) {
     *              obj.on(e, h, s);
     *          }
     *          console.timeEnd(key);
     *      }
     *  };
     *  testOn([m, c], 10000);
     * </code></pre>
     *
     * @class
     * @name alchemy.core.Ingredient
     * @extends alchemy.core.MateriaPrima
     */
    alchemy.formula.add({
        name: 'alchemy.core.Ingredient',
        alias: 'Ingredient',
        extend: 'alchemy.core.MateriaPrima',
        overrides: {
            /** @lends alchemy.core.Ingredient */

            /**
             * The List of public properties and methods;
             * E.g <code>['foo', 'bar', ...]
             *
             * @property publics
             * @type Array
             */
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
                    '    var ingredients = this.meta("ingredients"),',
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
                    '    var ingredients = this.meta("ingredients"),',
                    '        delegate = ingredients.', typeKey, ';',
                    '    return delegate.', key, ';',
                    '};',
                    'setter = function (value) {',
                    '    var ingredients = this.meta("ingredients"),',
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
                alchemy.extend(base, overrides);
            }
        }
    });
}());

