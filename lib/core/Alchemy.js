/*
 * Table of content:
 *
 * [section_properties]
 *      The public properties
 *
 * [section_utils]
 *      Utility methods (check id input is of type xy, mix, override, ...)
 *
 * [section_path]
 *      A submodule to manage file paths
 *
 * [section_formula]
 *      A submodule to manage formulas
 */
(function () {
    'use strict';

    var aliases = {};
    var potions = {};
    var isNode = false;
    var isBrowser = false;

    /**
     * helper method to register an alias
     * @private
     */
    function registerAlias(alias, fullname) {
        if (aliases[alias]) {
            // it should not be possible to override an alias because
            // - it is easy to override another by accident because of the missing namespaces
            // - it is possible to override another potion/formula by using the fullname the alias
            //   then refers to the new one
            throw 'Alias "' + alias + '" already used by "' + aliases[alias] + '"';
        }
        aliases[alias] = fullname;
    }

    /**
     * helper to turn the first letter of a string to upper case
     * @private
     */
    function ucFirst(s) {
        return alchemy.isString(s) ? s.charAt(0).toUpperCase() + s.substr(1, s.length) : '';
    }

    /**
     * The main units of alchemy.js are the "potions" of course. They are
     * the javascript prototypes which can be used to create other instances.
     * Each potions provides a <code>create</code> method.
     *
     * The function returns the respective potion. If there has no potion
     * with this name been created yet then it will be brewed based on the
     * available formulas. If no such formula is available then alchemy
     * will try loading one (this works synchronusly!).
     *
     * @name alchemy
     * @namespace
     * @function
     *
     * @param {String} potionName The identifier of the potion
     * @return Object The potion
     */
    var alchemy = function (potionName) {
        var name = aliases[potionName] || potionName;
        var potion = potions[name];

        if (potion) {
            return potion;
        }

        var formula = alchemy.formula.get(name);
        if (formula) {
            return alchemy.brew(formula);
        }

        if (alchemy.platform.isBrowser) {
            return window[name];
        }

        return null;
    };

    if (typeof module !== 'undefined') {
        isNode = true;
        module.exports = alchemy;
    } else if (typeof window !== 'undefined') {
        isBrowser = true;

        var orgRequire = window.require;
        window.require = function (pname) {
            var name = pname.replace(/^.*\//, '').replace(/\..*$/, '').toLowerCase();
            if (name === 'alchemy') {
                return alchemy;
            }

            if (alchemy.isFunction(orgRequire)) {
                // when using node-webkit then node's require method
                // will be available in the browser environment
                return orgRequire(pname);
            }

            return null;
        };

        window.module = window.module || {
            get exports() {
                return null;
            },

            set exports(potion) {
                if (alchemy.isFunction(potion)) {
                    potion(alchemy);
                }
            },
        };
    }

    //
    // [section_properties]
    //

    /**
     *
     *
     * @property platform
     * @type Object
     * @readonly
     */
    alchemy.platform = {
        isBrowser: isBrowser,
        isNode: isNode
    };

    /**
     * the prefix for internal type and method meta properties
     *
     * @property metaPrefix
     * @type String
     */
    alchemy.metaPrefix = '_AJS_';

    /**
     * <code>true</code> if and only if the all required sources are loaded
     * and the dom tree is ready for manipulation; read-only
     *
     * @property isReady
     * @type Boolean
     */
    alchemy.isReady = false;


    //
    // [section_utils]
    //

    /**
     * Prepares and configures the alchemical workbench (configures paths, loads
     * required sources, ...)
     *
     * @param {Object} cfg The configuration object:
     * @param {Object} [cfg.path] Optional, a path configuration; see {@link alchemy.path.set}
     * @param {String[]} [cfg.require] Optional, a set of formulas to load
     * @param {Function} [cfg.onReady] Optional, a callback executed when ready
     * @param {Boolean} [cfg.waitForDomReady] Optional, you can skipping the wait for the
     *      DOMContentLoaded event of browser by setting this option to <code>false</code>
     *      (Defaults to <code>true</code>)
     */
    alchemy.heatUp = function (cfg) {
        // apply defaults
        cfg = cfg || {};
        cfg.onReady = cfg.onReady || alchemy.emptyFn;

        // create method which will resolve the dependencies and call the given callback
        // we may have to wait for the platform to be ready
        var callback = function () {
            alchemy.formula.resolve(cfg.require || [], function () {
                alchemy.isReady = true;
                cfg.onReady();
            });
        };

        if (cfg.path) {
            alchemy.path.set(cfg.path);
        }

        if (alchemy.platform.isBrowser && !alchemy.isReady && cfg.waitForDomReady !== false) {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    };

    /**
     * Checks if a given item is an object.
     * Notice that every array is an object but not every object
     * is an array (which is also true for functions).
     *
     * @param {Various} o The item to be checked
     * @return {Boolean} <code>true</code> if the given item is an object
     */
    alchemy.isObject = function isObject(o) {
        return o && (typeof o === 'object' || typeof o === 'function');
    };

    /**
     * Checks if a given item is an array
     *
     * @param {Various} a The item to be checked
     * @return {Boolean} <code>true</code> if the given item is an array
     */
    alchemy.isArray = function isArray(a) {
        return a instanceof Array;
    };

    /**
     * Checks if a given item is a function
     *
     * @param {Various} f The item to be checked
     * @return {Boolean} <code>true</code> if the given item is a function
     */
    alchemy.isFunction = function isFunction(f) {
        return typeof f === 'function';
    };

    /**
     * Checks if a given item is a number
     *
     * @param {Various} n The item to be checked
     * @return {Boolean} <code>true</code> if the given item is a number
     */
    alchemy.isNumber = function isNumber(n) {
        return typeof n === 'number' && !isNaN(n);
    };

    /**
     * Checks if a given item is a string
     *
     * @param {Various} s The item to be checked
     * @return {Boolean} <code>true</code> if the given item is a string
     */
    alchemy.isString = function isString(s) {
        return typeof s === 'string';
    };

    /**
     * Checks if the given item is a boolean
     *
     * @param {Various} b the value to check
     * @return {Boolean} <code>true</code> if and only if the check is passed
     */
    alchemy.isBoolean = function isBoolean(b) {
        return typeof b === 'boolean';
    };

    /**
     * Checks if the given value is defined
     *
     * @param {Various} x the value to check
     * @return {Boolean} <code>true</code> if and only if the check is passed
     */
    alchemy.isDefined = function isDefined(x) {
        return alchemy.isNumber(x) || alchemy.isString(x) || alchemy.isObject(x) || alchemy.isArray(x) || alchemy.isFunction(x) || alchemy.isBoolean(x);
    };

    /**
     * Iterates of an iterable object and call the given method for each item
     * For example:
     * <pre><code>
     *      // (a) default use case iterate through an array or an object
     *      alchemy.each([1, 2, ..., n], function doStuff(val) { ... });
     *
     *      // (b) map data
     *      alchemy.each([1, 2, 3], function double(val) {
     *          return 2 * val;
     *      }); // -> [2, 4, 6]
     *      alchemy.each({foo: 1, bar: 2}, function double(val) {
     *          return 2 * val;
     *      }); // -> {foo: 2, bar: 4}
     *
     *      // (c) filter data
     *      alchemy.each([1, 2, 3, 4], function (val) {
     *          return (val % 2 === 0) ? val : undefined;
     *      }); // -> [2, 4]
     *      alchemy.each({ foo: 1, bar: 2, baz: 3, }, function uneven(val) {
     *          return (val % 2 !== 0) ? val : undefined;
     *      }); // -> { foo: 1, baz: 3 }
     * </code></pre>
     *
     * @param {Object/Array} iterable The object to iterate through
     * @param {Function} fn The callback function to be called for each item
     * @param {Object} scope The execution scope for the callback function
     * @param {Array} more Optional; an addional set of arguments which will
     *      be passed to the callback function
     * @return {Object/Array} The aggregated results of each callback (see examples)
     */
    alchemy.each = function each(iterable, fn, scope, more) {
        var args = [null, null];
        var result, resultSet;

        if (more !== undefined) {
            args = args.concat(more);
        }

        if (alchemy.isArray(iterable)) {
            resultSet = [];
            for (var i = 0, l = iterable.length; i < l; ++i) {
                args[0] = iterable[i];
                args[1] = i;
                result = fn.apply(scope, args);

                if (typeof result !== 'undefined') {
                    resultSet.push(result);
                }
            }
        } else if (alchemy.isObject(iterable)) {
            resultSet = {};
            for (var key in iterable) {
                if (iterable.hasOwnProperty(key)) {
                    args[0] = iterable[key];
                    args[1] = key;
                    result = fn.apply(scope, args);

                    if (typeof result !== 'undefined') {
                        resultSet[key] = result;
                    }
                }
            }
        }

        return resultSet;
    };

    /**
     * Mixes the given additives to the source object
     * Example usage:
     * <pre><code>
     * // first add defaults values to a new object and then overrides the defaults
     * // with the actual values
     * alchemy.mix({}, defaults, values);
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
    alchemy.mix = (function () {
        function mixOneItem(value, key, obj) {
            obj[key] = value;
        }
        return function () {
            var args = Array.apply(null, arguments);
            var base = args.shift();
            var next;

            while (args.length) {
                next = args.shift();
                alchemy.each(next, mixOneItem, null, [base]);
            }
            return base;
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
     * alchemy.override(obj, {
     *      foo: alchemy.override(function (_super) {
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
    alchemy.override = (function () {
        // helper to decide whether it is a magic meta function that creates the actual object method
        function isMagicMethod(fn) {
            return fn && (fn.hocuspocus === true);
        }

        // helper to identify property descriptors
        function isPropertyDef(obj) {
            return alchemy.isObject(obj) && alchemy.meta(obj, 'isProperty');
        }

        // helper method to add a single property
        function addProperty(prop, key, obj) {
            if (alchemy.isFunction(prop)) {
                if (isMagicMethod(prop)) {
                    // you said the magic words so you will get your reference to the overridden method
                    prop = prop(obj[key]);
                }
            }
            if (isPropertyDef(prop)) {
                alchemy.defineProperty(obj, key, prop);
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

            alchemy.each(overrides, addProperty, null, [base]);

            return base;
        };
    }());

    /**
     * @function
     */
    alchemy.extend = function extend(base, overrides) {
        var extended = Object.create(base);

        if (alchemy.isFunction(overrides)) {
            overrides = overrides(base);
        }

        if (overrides) {
            alchemy.override(extended, overrides);
        }

        return extended;
    };

    /**
     * Extract values of a specific property from a given set of items
     * For example:
     * <pre><code>
     * alchemy.extract([{key: 'foo'}, {key: 'bar'}, ... ], 'key'); // -> ['foo', 'bar', ...]
     * alchemy.extract({o1: {key: 'foo'}, o2: {key: 'bar'}, ...}, 'key'); // -> ['foo', 'bar', ...]
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
    alchemy.extract = (function () {
        function extractOne(item, index, key, result) {
            if (alchemy.isObject(item)) {
                result.push(item[key]);
            }
        }
        return function (list, property) {
            var result = [];
            alchemy.each(list, extractOne, null, [property, result]);
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
     * alchemy.unique([1, 3, 4, 1, 3, 5]); // -> [1, 3, 4, 5]
     * alchemy.unique({foo: 'foo', bar: 'foo', baz: 'baz'); // -> {foo: 'foo', baz: 'baz'}
     */
    alchemy.unique = function unique(list) {
        var used = {};
        return alchemy.each(list, function (item) {
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
     * alchemy.union([1, 2, 4, 10], [3, 4], [1, 2, 5, 101]); // -> [1, 2, 4, 10, 3, 5, 101]
     * alchemy.union({foo: 'foo'}, {bar: 'bar'}, {bar: 'baz'}); // -> ['foo', 'bar', 'baz']
     * alchemy.union({foo: 'foo'}, ['foo', 'bar'], {bar: 'baz'}) // -> ['foo', 'bar', 'baz']
     */
    alchemy.union = (function () {
        function processOneArgument(array, index, result, seen) {
            alchemy.each(array, processOneValue, null, [result, seen]);
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

            alchemy.each(args, processOneArgument, null, [result, seen]);
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
    alchemy.values = (function () {
        function addValueToResultSet(value, key, resultSet) {
            resultSet.push(value);
        }

        return function values(hash) {
            if (!hash || typeof hash !== 'object') {
                return;
            }

            var result = [];
            alchemy.each(hash, addValueToResultSet, null, [result]);

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
    alchemy.meta = function (obj, key, value) {
        key = alchemy.metaPrefix + key;
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
     * one with {@link alchemy.override}</li>
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
    alchemy.defineProperty = function (obj, prop, opts) {
        if (arguments.length === 1) {
            // Mode B: mark it as a properties so alchemy.override will
            // know what to do
            alchemy.meta(obj, 'isProperty', true);
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

            if (alchemy.isBoolean(opts.get)) {
                // "get" was simply set to true -> get the name from the property ("foo" -> "getFoo")
                opts.get = 'get' + ucFirst(prop);
            }
            if (alchemy.isString(opts.get)) {
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

            if (alchemy.isBoolean(opts.set)) {
                // "set" was simply set to true -> get the name from the property ("foo" -> "setFoo")
                opts.set = 'set' + ucFirst(prop);
            }
            if (alchemy.isString(opts.set)) {
                var setterName = opts.set;
                opts.set = function (value) {
                    return this[setterName](value);
                };
            }
        }

        return Object.defineProperty(obj, prop, opts);
    };

    /**
     * brews a new prototype based on the given ingredients
     *
     * @param {Object} typeDef The type definition configuration; accepted properties are:
     * @param {Object|String} [typeDef.extend] The prototype that should be extended
     * @param {String} [typeDef.name] The name under which the new type should be registered
     *      in the given namespace;
     *      NOTICE: This may overwrite existing type definitions!
     * @param {String} [typeDef.alias] An shortname for the potion
     * @param {Object} [typeDef.overrides] A set of properties and methods the new prototype should
     *      get (see {@link alchemy.override} for details)
     *
     * @return Object
     *      the new prototype
     */
    alchemy.brew = function (typeDef) {
        if (typeDef.api === 'v2') {
            return brewV2(typeDef);
        }

        return brewV1(typeDef);
    };

    /** @private */
    function brewV1(typeDef) {
        var SuperType = typeDef.extend || alchemy('alchemy.core.MateriaPrima');
        var includes = typeDef.ingredients;
        var overrides = typeDef.overrides;
        var NewType;
        var meta = [];

        if (alchemy.isString(SuperType)) {
            SuperType = alchemy(SuperType);
        }
        NewType = Object.create(SuperType);

        if (overrides && overrides.hasOwnProperty('constructor')) {
            NewType.constructor = overrides.constructor;
            NewType.constructor.prototype = NewType;
            delete overrides.constructor;
        } else {
            NewType.constructor = function (cfg) {
                SuperType.constructor.call(this, cfg);
            };
            NewType.constructor.prototype = NewType;
        }

        if (typeDef.name) {
            // register new type in global namespace
            potions[typeDef.name] = NewType;
            meta.push(['name', typeDef.name]);
        }

        if (typeDef.alias) {
            // register a shortcut
            if (!aliases[typeDef.alias]) {
                registerAlias(typeDef.alias, typeDef.name);
            }
            meta.push(['alias', typeDef.alias]);
        }

        if (includes) {
            // enhance new prototype with given ingredients (mixins)
            alchemy.each(includes, function (item, key) {
                var cfg;
                if (alchemy.isString(item)) {
                    cfg = {
                        potion: item,
                        init: false,
                        delegate: false,
                    };
                } else {
                    cfg = alchemy.mix({
                        init: false,
                        delegate: false,
                    }, item);
                }

                NewType.addIngredient(key, cfg);
            });
        }

        if (alchemy.isFunction(overrides)) {
            var dependencies = [SuperType].concat(alchemy.each(typeDef.requires, function (name) {
                return alchemy(name);
            }));

            overrides = overrides.apply(null, dependencies);
        }
        if (overrides) {
            alchemy.override(NewType, overrides);
        }

        meta.push(['supertype', SuperType]);
        alchemy.each(meta, function (metaAttr) {
            alchemy.meta(NewType, metaAttr[0], metaAttr[1]);
        });

        return NewType;
    }

    /** @private */
    function brewV2(typeDef) {
        var potion = typeDef.potion || {};
        var dependencies = alchemy.each(typeDef.requires, function (name) {
            return alchemy(name);
        });

        if (typeof potion === 'function') {
            potion = potion.apply(null, dependencies);
        }

        if (typeDef.name) {
            // register new type in potion store
            potions[typeDef.name] = potion;
            alchemy.meta(potion, 'name', typeDef.name);
        }

        if (typeDef.alias) {
            // register a shortcut
            registerAlias(typeDef.alias, typeDef.name);
            alchemy.meta(potion, 'alias', typeDef.alias);
        }

        return potion;
    }

    /**
     * creates a unique identifier
     * @function
     *
     * @return {String}
     *      the generated identifier
     *
     */
    alchemy.id = (function () {
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
    alchemy.uuid = function () {
        var d = alchemy.now();
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
    alchemy.emptyFn = function () {};

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
    alchemy.now = (function () {
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


    ///////////////////////////////////////////////////////////////////////////
    //
    // MODULE: path [section_path]
    //
    //

    function PathModule() {
        this.pathMap = {
            alchemy: '../../lib',
        };
    }

    /**
     * Returns the filepath to a given namespace
     *
     * @param {String} ns The name space
     * @return {String} The file path
     */
    PathModule.prototype.map = function (ns) {
        var parts = ns.split('.');
        var result = [];

        while (parts.length > 0) {
            var match = this.pathMap[parts.join('.')];
            if (match) {
                result.unshift(match);
                break;
            } else {
                result.unshift(parts.pop());
            }
        }

        return result.join('/');
    };

    /**
     * Returns the configured path to a given namespace
     *
     * @param {String} [ns] Optional. The namespace; the paths of all packages
     *  are returned if missing
     *
     * @return {String/Object} The path if a valid package is given
     *      An Object with all paths if namespace is omitted
     *      <code>undefined</code> the given namespace is unknown
     */
    PathModule.prototype.get = function (ns) {
        return ns ? this.pathMap[ns] : this.pathMap;
    };

    /**
     * Add new configurations or change existing ones
     *
     * @param {Object} cfg The name space cfg; Each key represents a
     *      namespace and the value should be the path
     */
    PathModule.prototype. set = function (cfg) {
         this.pathMap = alchemy.mix(this.pathMap, cfg);
    };


    ///////////////////////////////////////////////////////////////////////////
    //
    // MODULE: formula [section_formula]
    //
    //

    function FormulaModule() {
        this.resolved = {};
        this.cache = {};
    }

    /**
     * helper method to traverse all registered formulas and add all dependencies
     * which may have to be resolved
     * @private
     */
    FormulaModule.prototype.collectCandidates = function () {
        var candidates = [];

        alchemy.each(this.cache, function (def) {
            candidates.push(def.extend);

            if (def.requires) {
                candidates = candidates.concat(def.requires || []);
            }

            if (def.ingredients) {
                alchemy.each(def.ingredients, function (ingr) {
                    if (alchemy.isString(ingr)) {
                        candidates.push(ingr);
                    } else if (alchemy.isObject(ingr) && alchemy.isString(ingr.potion)) {
                        candidates.push(ingr.potion);
                    }
                });
            }
        });

        return candidates;
    };

    /**
     * helper method to filter the possible canditates
     * @private
     */
    FormulaModule.prototype.filterCandidates = function (candidates) {
        var dependencies = [];

        for (var i = 0, l = candidates.length; i < l; i++) {
            var c = candidates[i];
            if (alchemy.isString(c) && !this.resolved[c] && dependencies.indexOf(c) < 0) {
                dependencies.push(c);
            }
        }

        return dependencies;
    };

    /**
     * Adds a new formula to the cache;
     * A formula has to be an Object with at least the property "name";
     * See {@link alchemy.brew} for more details on formulas
     *
     * @param {Object} formula The formula to add
     */
    FormulaModule.prototype.add = function (formula, overrides) {
        if (!alchemy.isObject(formula)) {
            throw 'Invalid formula: ' + formula;
        }

        if (!formula.name) {
            throw 'Missing required property "name"';
        }

        if (formula.alias) {
            registerAlias(formula.alias, formula.name);
        }

        formula.overrides = formula.overrides || overrides;

        this.cache[formula.name] = formula;
        this.resolved[formula.name] = true;
    };

    /**
     * New experimental API to define potion formulas
     *
     * @param {String} name The name of the new potion
     * @param {Array} dependencies The dependencies of the potion
     * @param {Function|Object} potion The potion formula to add
     */
    FormulaModule.prototype.define = function (name, dependencies, potion) {
        return this.add({
            name: name,
            requires: dependencies,
            api: 'v2',
            potion: potion
        });
    };

    /**
     * Returns the formula to a given name; If there has no formula with
     * the name been cached yet it is going to be loaded (nodejs only!)
     *
     * @param {String} name The name of the formula
     * @return {Object} The formula
     */
    FormulaModule.prototype.get = function (name) {
        return this.cache[name];
    };

    /**
     * Returns the set of unresolve dependencies
     *
     * @return {Array}
     */
    FormulaModule.prototype.dependencies = function () {
        return this.filterCandidates(this.collectCandidates());
    };

    /**
     * Resolves the dependencies by loading the required formulas
     *
     * @param {Array} dependencies An array of formula names to load;
     *      If this initial set produces new dependencies then these
     *      will be loaded too
     *
     * @param {Function} callback Callback method; executed if all
     *      dependencies are resolved;
     */
    FormulaModule.prototype.resolve = function (dependencies, callback, iteration) {
        iteration = iteration >= 0 ? iteration : 0;

        if (iteration > 1000) {
            throw 'Cannot resolve the following dependencies: "' + dependencies.join('", "') + '"';
        }

        var size = dependencies.length;
        if (size === 0) {
            // no further unresolved dependencies
            // -> finish
            if (alchemy.isFunction(callback)) {
                callback();
            }
            return;
        }

        var self = this;
        var onLoad = function () { // callback for loading a single formula
            size--;
            if (size === 0) {
                // all formulas of first batch loaded
                // -> recalculate dependencies and load those too
                self.resolve(self.dependencies(), callback, iteration + 1);
            }
        };

        alchemy.each(dependencies, function (formulaName) {
            var scriptUrl = alchemy.path.map(formulaName) + '.js';

            this.resolved[formulaName] = true;

            if (alchemy.platform.isBrowser) {
                var script = document.createElement('script');
                script.src = scriptUrl;
                script.onload = onLoad;
                document.head.appendChild(script);
            } else if (alchemy.platform.isNode) {
                var result = require(scriptUrl);
                if (alchemy.isFunction(result)) {
                    result(alchemy);
                }
                onLoad();
            }
        }, this);
    };

    if (isNode) {
        alchemy.override(alchemy, require('./../node/alchemy.js'));

        FormulaModule.prototype = alchemy.extend(
            FormulaModule.prototype,
            require('./../node/alchemy.formula.js')(alchemy)
        );
    }


    /**
     * A submodule for managing the formulas (see module methods for further
     * descriptions)
     *
     * @property formula
     * @type Object
     */
    alchemy.formula = new FormulaModule();
    alchemy.FormulaModule = FormulaModule;

    /**
     * A submodule to handle the file paths of logical namespaces;
     * See description of submethods for further details
     *
     * @property path
     * @type Object
     */
    alchemy.path = new PathModule();
    alchemy.PathModule = PathModule;
})();

