/*
 *   “Medicine, and Law, and Philosophy -
 *    You've worked your way through every school,
 *    Even, God help you, Theology,
 *    And sweated at it like a fool.
 *    Why labour at it any more?
 *    You're no wiser now than you were before.
 *    You're Master of Arts, and Doctor too,
 *    And for ten years all you've been able to do
 *    Is lead your students a fearful dance
 *    Through a maze of error and ignorance.
 *    And all this misery goes to show
 *    There's nothing we can ever know.
 *    Oh yes you're brighter than all those relics,
 *    Professors and Doctors, scribblers and clerics,
 *    No doubts or scruples to trouble you,
 *    Defying hell, and the Devil too.
 *    But there's no joy in self-delusion;
 *    Your search for truth ends in confusion.
 *    Don't imagine your teaching will ever raise
 *    The minds of men or change their ways.
 *    And as for worldly wealth, you have none -
 *    What honour or glory have you won?
 *    A dog could stand this life no more.
 *    And so I've turned to magic lore;
 *    The spirit message of this art
 *    Some secret knowledge might impart.
 *    No longer shall I sweat to teach
 *    What always lay beyond my reach;
 *    I'll know what makes the world revolve,
 *    Its mysteries resolve,
 *    No more in empty words I'll deal -
 *    Creation's wellsprings I'll reveal!”
 *            ― Johann Wolfgang von Goethe, Faust
 */
module.exports = (function () {
    'use strict';

    var isBrowser = typeof window !== 'undefined';
    var each = require('pro-singulis');
    var Utils = {};

    /**
     * helper to turn the first letter of a string to upper case
     * @private
     */
    function ucFirst(s) {
        return Utils.isString(s) ? s.charAt(0).toUpperCase() + s.substr(1, s.length) : '';
    }

    /**
     * the prefix for internal type and method meta properties
     *
     * @property metaPrefix
     * @type String
     */
    Utils.metaPrefix = '_AJS_';

    /**
     * Checks if a given item is an object.
     * Notice that every array is an object but not every object
     * is an array (which is also true for functions).
     *
     * @param {Various} o The item to be checked
     * @return {Boolean} <code>true</code> if the given item is an object
     */
    Utils.isObject = function isObject(o) {
        return o && (typeof o === 'object' || typeof o === 'function');
    };

    /**
     * Checks if a given item is an array
     *
     * @param {Various} a The item to be checked
     * @return {Boolean} <code>true</code> if the given item is an array
     */
    Utils.isArray = function isArray(a) {
        return a instanceof Array;
    };

    /**
     * Checks if a given item is a function
     *
     * @param {Various} f The item to be checked
     * @return {Boolean} <code>true</code> if the given item is a function
     */
    Utils.isFunction = function isFunction(f) {
        return typeof f === 'function';
    };

    /**
     * Checks if a given item is a number
     *
     * @param {Various} n The item to be checked
     * @return {Boolean} <code>true</code> if the given item is a number
     */
    Utils.isNumber = function isNumber(n) {
        return typeof n === 'number' && !isNaN(n);
    };

    /**
     * Checks if a given item is a string
     *
     * @param {Various} s The item to be checked
     * @return {Boolean} <code>true</code> if the given item is a string
     */
    Utils.isString = function isString(s) {
        return typeof s === 'string';
    };

    /**
     * Checks if the given item is a boolean
     *
     * @param {Various} b the value to check
     * @return {Boolean} <code>true</code> if and only if the check is passed
     */
    Utils.isBoolean = function isBoolean(b) {
        return typeof b === 'boolean';
    };

    /**
     * Checks if the given value is defined
     *
     * @param {Various} x the value to check
     * @return {Boolean} <code>true</code> if and only if the check is passed
     */
    Utils.isDefined = function isDefined(x) {
        return Utils.isNumber(x) || Utils.isString(x) || Utils.isObject(x) || Utils.isArray(x) || Utils.isFunction(x) || Utils.isBoolean(x);
    };

    /**
     * Iterates of an iterable object and call the given method for each item
     * For example:
     * <pre><code>
     *      // (a) default use case iterate through an array or an object
     *      Utils.each([1, 2, ..., n], function doStuff(val) { ... });
     *
     *      // (b) map data
     *      Utils.each([1, 2, 3], function double(val) {
     *          return 2 * val;
     *      }); // -> [2, 4, 6]
     *      Utils.each({foo: 1, bar: 2}, function double(val) {
     *          return 2 * val;
     *      }); // -> {foo: 2, bar: 4}
     *
     *      // (c) filter data
     *      Utils.each([1, 2, 3, 4], function (val) {
     *          return (val % 2 === 0) ? val : undefined;
     *      }); // -> [2, 4]
     *      Utils.each({ foo: 1, bar: 2, baz: 3, }, function uneven(val) {
     *          return (val % 2 !== 0) ? val : undefined;
     *      }); // -> { foo: 1, baz: 3 }
     * </code></pre>
     *
     * @deprecated
     *
     * @param {Object/Array} iterable The object to iterate through
     * @param {Function} fn The callback function to be called for each item
     * @param {Object} scope The execution scope for the callback function
     * @param {Array} more Optional; an addional set of arguments which will
     *      be passed to the callback function
     * @return {Object/Array} The aggregated results of each callback (see examples)
     */
    Utils.each = each;

    /**
     * Mixes the given additives to the source object
     * Example usage:
     * <pre><code>
     * // first add defaults values to a new object and then overrides the defaults
     * // with the actual values
     * Utils.mix({}, defaults, values);
     * </code></pre>
     * @function
     *
     * @param {Object} base
     *      the source object (will be modified!)
     *
     * @param {Object} ...overrides
     *      the set of additives
     *
     * @return Object
     *      the modified source object
     */
    Utils.mix = (function () {
        function mixOneItem(value, key, obj) {
            obj[key] = value;
        }

        return function () {
            var args = Array.apply(null, arguments);
            var base = args.shift();
            var next;

            while (args.length) {
                next = args.shift();
                each(next, mixOneItem, null, [base]);
            }
            return base;
        };
    }());

    /**
     * Melts two object deeply together in a new object
     * Example usage:
     *
     * <pre><code>
     *   Utils.melt({ foo: 1 }, { bar: 1 }); // -> { foo: 1, bar: 1 };
     *   Utils.melt({}, someObj); // -> deep clone of someObj
     * </code></pre>
     *
     * NOTICE: Array and none-data-objects (objects with a constructor other
     * than Object) are treated as atomic value and are not merged
     * @function
     *
     * @param {Object} obj1 First source object
     * @param {Object} obj2 The second source object
     * @return Object The deeply melted result
     */
    Utils.melt = (function () {
        var meltValue = each.prepare(function (value, key, result) {
            if (value && (value.constructor === Object)) {
                result[key] = Utils.melt(result[key], value);
            } else {
                result[key] = value;
            }
        }, null);

        return function (obj1, obj2) {
            var result = {};

            meltValue(obj1, [result]);
            meltValue(obj2, [result]);

            return result;
        };
    }());

    /**
     * Allows overriding methods of an given object. If the base object has
     * already a method with the same key this one will be hidden but does not
     * get lost. You can access the overridden method using
     * <code>_super.call(this, ...)</code>
     *
     * For example: <pre><code>
     * var obj = {
     *      foo: function () {
     *          return 'foo';
     *      }
     * };
     *
     * Utils.override(obj, {
     *      foo: Utils.override(function (_super) {
     *          return function () {
     *              return _super.call(this) + ' - bar';
     *          };
     *      })
     * });
     *
     * obj.foo(); // will return 'foo - bar'
     * </code></pre>
     * @function
     *
     * @param {Object} base
     *      The base object to be overridden (will be modified!)
     *
     * @param {Object} overrides
     *      The set of new methods
     *
     * @return {Object}
     *      The modified object
     */
    Utils.override = (function () {
        // helper to decide whether it is a magic meta function that creates the actual object method
        function isMagicMethod(fn) {
            return fn && (fn.hocuspocus === true);
        }

        // helper to identify property descriptors
        function isPropertyDef(obj) {
            return Utils.isObject(obj) && Utils.meta(obj, 'isProperty');
        }

        // helper method to add a single property
        function addProperty(prop, key, obj) {
            if (Utils.isFunction(prop)) {
                if (isMagicMethod(prop)) {
                    // you said the magic words so you will get your reference to the overridden method
                    prop = prop(obj[key]);
                }
            }
            if (isPropertyDef(prop)) {
                Utils.defineProperty(obj, key, prop);
            } else {
                obj[key] = prop;
            }
        }

        return function (base, overrides) {
            if (typeof base === 'function' && typeof overrides === 'undefined') {
                base.hocuspocus = true;
                return base;
            }

            if (overrides && overrides.constructor !== Object.prototype.constructor) {
                addProperty(overrides.constructor, 'constructor', base);
            }

            each(overrides, addProperty, null, [base]);

            return base;
        };
    }());

    /**
     * @function
     */
    Utils.extend = function extend(base, overrides) {
        var extended = Object.create(base);

        if (Utils.isFunction(overrides)) {
            overrides = overrides(base);
        }

        if (overrides) {
            Utils.override(extended, overrides);
        }

        return extended;
    };

    /**
     * Extract values of a specific property from a given set of items
     * For example:
     * <pre><code>
     * Utils.extract([{key: 'foo'}, {key: 'bar'}, ... ], 'key'); // -> ['foo', 'bar', ...]
     * Utils.extract({o1: {key: 'foo'}, o2: {key: 'bar'}, ...}, 'key'); // -> ['foo', 'bar', ...]
     * </code></pre>
     * @function
     *
     * @param {Array/Object} list
     *      The initial set of items
     *
     * @param {String} property
     *      The name of the property to extract
     *
     * @param {Array}
     *      The array of extracted values
     */
    Utils.extract = (function () {
        function extractOne(item, index, key, result) {
            if (Utils.isObject(item)) {
                result.push(item[key]);
            }
        }
        return function (list, property) {
            var result = [];
            each(list, extractOne, null, [property, result]);
            return result;
        };
    }());

    /**
     * Filtes a set (array or hash object) to contain only unique values
     *
     * @param {Array|Object} list The list to be filtered
     * @return {Array|Object} The filtered list
     *
     * @example
     * Utils.unique([1, 3, 4, 1, 3, 5]); // -> [1, 3, 4, 5]
     * Utils.unique({foo: 'foo', bar: 'foo', baz: 'baz'); // -> {foo: 'foo', baz: 'baz'}
     */
    Utils.unique = function unique(list) {
        var used = {};
        return each(list, function (item) {
            if (used[item]) {
                return;
            }

            used[item] = true;
            return item;
        });
    };

    /**
     * Creates a set of unique values from the given input
     * @function
     *
     * @param {Array|Object} ...args The initial data sets
     *
     * @return {Array} An array containing the unique values
     *
     * @example
     * Utils.union([1, 2, 4, 10], [3, 4], [1, 2, 5, 101]); // -> [1, 2, 4, 10, 3, 5, 101]
     * Utils.union({foo: 'foo'}, {bar: 'bar'}, {bar: 'baz'}); // -> ['foo', 'bar', 'baz']
     * Utils.union({foo: 'foo'}, ['foo', 'bar'], {bar: 'baz'}) // -> ['foo', 'bar', 'baz']
     */
    Utils.union = (function () {
        function processOneArgument(array, index, result, seen) {
            each(array, processOneValue, null, [result, seen]);
        }

        function processOneValue(value, index, result, seen) {
            if (!seen[value]) {
                result.push(value);
                seen[value] = true;
            }
        }

        return function () {
            var result = [];
            var seen = {};
            var args = Array.apply(null, arguments);

            each(args, processOneArgument, null, [result, seen]);
            return result;
        };
    }());

    /**
     * Returns the values of a hash object as an array
     * @function
     *
     * @param {Object} hash The key-value-hash-map
     * @return {Array} An array containing the values
     */
    Utils.values = (function () {
        function addValueToResultSet(value, key, resultSet) {
            resultSet.push(value);
        }

        return function values(hash) {
            if (!hash || typeof hash !== 'object') {
                return;
            }

            var result = [];
            each(hash, addValueToResultSet, null, [result]);

            return result;
        };
    }());

    /**
     * Reads and writes the value of a meta attribute from/to
     * a given object
     *
     * @param {Object} obj The object with the meta property
     * @param {String} key The identifier of the attribute
     * @param {Mixed} [value] (Optional) The new value;
     *      If ommitted the value will not be changed
     * @return {Mixed} The current value of the meta attributes
     */
    Utils.meta = function (obj, key, value) {
        key = Utils.metaPrefix + key;
        if (value !== undefined) {
            obj[key] = value;
        }
        return obj[key];
    };

    /**
     * This method works in two different mode:<ul>
     *
     * <li>Mode (A) will work similar to Object.defineProperty (see
     * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty)
     * but with a few defaults switched. New properties are by default writable,
     * enumerable and configurable whichh is IMO more natural.
     *
     * <li>Mode (B) let you mark a given object as a property definition which
     * will be evaluated when brewing a prototype or adding the property to
     * one with {@link Utils.override}</li>
     *
     * </ul>
     *
     * @param {Object} obj The object which should get the property (mode A)
     *      or the property definition (mode B)
     *      (NOTICE that either way the given object will be modified)
     * @param {String} [prop] The name of the property (mode A); empty (mode B)
     * @param {Object} [opts] The property definition (mode A); empty (mode B)
     *
     * @return obj The modified object
     */
    Utils.defineProperty = function (obj, prop, opts) {
        if (arguments.length === 1) {
            // Mode B: mark it as a properties so Utils.override will
            // know what to do
            Utils.meta(obj, 'isProperty', true);
            return obj;
        }

        // Mode A: define the new property "prop" for object "obj"

        // switch the defaults to be truthy unless said otherwise
        opts = opts || {};
        opts.writable = (opts.writable !== false);
        opts.enumerable = (opts.enumerable !== false);
        opts.configurable = (opts.configurable !== false);

        if (opts.get) {
            delete opts.writable; // writable/value is not allowed when defining getter/setter
            delete opts.value;

            if (Utils.isBoolean(opts.get)) {
                // "get" was simply set to true -> get the name from the property ("foo" -> "getFoo")
                opts.get = 'get' + ucFirst(prop);
            }
            if (Utils.isString(opts.get)) {
                // "get" was set to the getter's name
                // -> create a function that calls the getter (this way we can
                // later override the method)
                var getterName = opts.get;
                opts.get = function () {
                    return this[getterName]();
                };
            }
        }

        if (opts.set) {
            delete opts.writable; // writable/value is not allowed when defining getter/setter
            delete opts.value;

            if (Utils.isBoolean(opts.set)) {
                // "set" was simply set to true -> get the name from the property ("foo" -> "setFoo")
                opts.set = 'set' + ucFirst(prop);
            }
            if (Utils.isString(opts.set)) {
                var setterName = opts.set;
                opts.set = function (value) {
                    return this[setterName](value);
                };
            }
        }

        return Object.defineProperty(obj, prop, opts);
    };

    /**
     * creates a unique identifier
     * @function
     *
     * @return {String}
     *      the generated identifier
     *
     */
    Utils.id = (function () {
        var counter = 0;
        return function () {
            return 'AJS-' + (counter++);
        };
    }());

    /**
     * Returns a UUID
     * (source http://stackoverflow.com/a/8809472)
     * @function
     *
     * @return {String} the UUID
     */
    Utils.uuid = function () {
        var d = Utils.now();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            /* jshint bitwise: false */
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            /* jshint bitwise: true */
        });
        return uuid;
    };

    /**
     * an reuseable empty function object
     */
    Utils.emptyFn = function () {};

    /**
     * Returns the number of milliseconds, accurate to a thousandth of a
     * millisecond, from the start of document navigation to the time the
     * now method was called.
     * Shim for window.performance.now(); see http://www.w3.org/TR/animation-timing/
     * @function
     *
     * @return {Number} The time in ms relative to the start of the
     *      document navigation
     */
    Utils.now = (function () {
        if (isBrowser && window.performance && window.performance.now) {
            // use window.perfomance.now (which is the reference) if possible
            return function () {
                return window.performance.now();
            };

        }

        // fallback to Date.now()
        var loadTime = Date.now();
        return function () {
            return Date.now() - loadTime;
        };
    }());

    return Utils;
})();
