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

    var beEvil;

    (function () {
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
            } else {
                aliases[alias] = fullname;
            }
        }

        /**
         * helper to turn the first letter of a string to upper case
         * @private
         */
        function ucFirst(s) {
            return alchemy.isString(s) ? s.charAt(0).toUpperCase() + s.substr(1, s.length) : '';
        }

        /**
         * The main units of alchemy.js are the "potions" of course. They are the javascript prototypes which can be
         * used to create other instances. Each potions provides a <code>create</code> method.
         *
         * The function returns the respective potion. If there has no potion with this name been created yet then it
         * will be brewed based on the available formulas. If no such formula is available then alchemy will try
         * loading one (this works synchronusly!).
         *
         * @name alchemy
         * @namespace
         * @function
         *
         * @param {String} potionName
         *      the identifier of the potion
         *
         * @return Object
         *      the potion
         */
        var alchemy = function (potionName) {
            var name = aliases[potionName] || potionName;
            var potion = potions[name];
            if (!potion) {
                potion = alchemy.brew(alchemy.formula.get(name));
            }
            return potion;
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
        }

        //
        // [section_properties]
        //

        /**
         * the current version of the framework; read-only
         *
         * @property version
         * @type String
         * @readonly
         */
        alchemy.version = '0.2.0';

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
         * A shortcut of "hasOwnProperty"
         * @function
         */
        alchemy.hop = (function () {
            var hop = Object.prototype.hasOwnProperty;
            return function (obj, prop) {
                return hop.call(obj, prop);
            };
        }());

        /**
         * Iterates of an iterable object and call the given method for each item
         *
         * @param {Object/Array} iterable The object to iterate through
         * @param {Function} fn The callback function to be called for each item
         * @param {Object} scope The execution scope for the callback function
         * @param {Array} more Optional; an addional set of arguments which will
         *      be passed to the callback function
         */
        alchemy.each = function each(iterable, fn, scope, more) {
            var args = [null, null];

            if (more !== undefined) {
                args = args.concat(more);
            }
            if (alchemy.isArray(iterable)) {
                for (var i = 0, l = iterable.length; i < l; ++i) {
                    args[0] = iterable[i];
                    args[1] = i;
                    fn.apply(scope, args);
                }
            } else if (alchemy.isObject(iterable)) {
                for (var key in iterable) {
                    if (alchemy.hop(iterable, key)) {
                        args[0] = iterable[key];
                        args[1] = key;
                        fn.apply(scope, args);
                    }
                }
            }
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
         * Overrides methods of an given object
         * If the base object has already a method with the same key this one will be hidden but does not get lost.
         * You can access the overridden method using <code>_super.call(this, ...)</code>
         * For example:
         * <pre><code>
         * var obj = {
         *      foo: function () {
         *          return 'foo';
         *      }
         * };
         *
         * alchemy.extend(obj, {
         *      foo: alchemy.override(function (_super) {
         *          // The "hocuspocus" is vital.
         *          // So alchemy will know it is a method to call with the reference of the overridden method
         *          // to get the actual subtype method
         *
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
        alchemy.extend = (function () {
            // helper method to get the function name (since Function.prototype.name
            // is a none-standard property we may have to uses some magic)
            function getFnName(fn) {
                return fn.name || (fn.toString().match(/function (.+?)\(/) || [,''])[1] || '';
            }

            // helper to decide whether it is a magic meta function that creates the actual object method
            function isMagicMethod(fn) {
                return fn && (fn.hocuspocus || getFnName(fn).toLowerCase() === 'hocuspocus');
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
                if (overrides.constructor !== Object.prototype.constructor) {
                    addProperty(overrides.constructor, 'constructor', base);
                }
                alchemy.each(overrides, addProperty, null, [base]);
                return base;
            };
        }());

        /**
         * Marks the given function as a magic function which can be use to  override an
         * object method (see {@link alchemy.extend}
         *
         * @param {Function} fn The meta function to be annotated
         * @return {Function} The same function object which has been marked as magic
         */
        alchemy.override = function (fn) {
            if (!fn.name) {
                fn.hocuspocus = true;
            }
            return fn;
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
                if (item) {
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
         * one with {@link alchemy.extend}</li>
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
            if (arguments.length === 3) {
                // Mode A: define the new property "prop" for object "obj"
                if (opts && opts.meta) {
                    // add prefix to meta properties to avoid conflicts
                    // with regular attributes
                    prop = alchemy.metaPrefix + prop;
                    delete opts.meta;
                }

                // switch the defaults to be truthy unless said otherwise
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
            } else if (arguments.length === 1) {
                // Mode B: mark it as a properties so alchemy.extend will
                // know what to do
                alchemy.meta(obj, 'isProperty', true);
                return obj;
            }
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
         *      get (see {@link alchemy.extend} for details)
         *
         * @return Object
         *      the new prototype
         */
        alchemy.brew = function (typeDef) {
            var SuperType = typeDef.extend || alchemy('alchemy.core.MateriaPrima');
            var includes = typeDef.ingredients;
            var overrides = typeDef.overrides;
            var NewType;
            var meta = [];

            if (alchemy.isString(SuperType)) {
                SuperType = alchemy(SuperType);
            }
            NewType = Object.create(SuperType);

            if (overrides && alchemy.hop(overrides, 'constructor')) {
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
                overrides = overrides(SuperType);
            }
            if (overrides) {
                alchemy.extend(NewType, overrides);
            }

            meta.push(['supertype', SuperType]);
            alchemy.each(meta, function (metaAttr) {
                alchemy.meta(NewType, metaAttr[0], metaAttr[1]);
            });
            return NewType;
        };


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
         * Retruns a random number between a given maximun and minimum
         *
         * @param {Number} max
         *    The maximal value
         * @param {Number} min
         *
         *    Optional; The minimal value; Defaults to zero;
         *
         * @return {Number}
         *    the random result
         */
        alchemy.random = function (max, min) {
            min = typeof min === 'number' ? min : 0;
            return Math.floor(Math.random() * (max - min + 1) + min);
        };

        /**
         * an reuseable empty function object
         */
        alchemy.emptyFn = function () {};

        /**
         * A lean render engine
         *
         * The implementation was inspired by John Resig's Micro-Templating
         * (see http://ejohn.org/blog/javascript-micro-templating/) but I had
         * to change a few things:
         *  - "with(...)" does not work in strict mode
         *  - Resig's method works in browser only (document.getElementById ...)
         *  - It is more readable (i.e. He uses split and join to simulate a replace
         *  because it may be faster. Well, it might be but it is also a very
         *  good example why not to optimize.)
         * @function
         *
         * @param {String} template
         *      Well, the template...
         *      You can reference values by <code>data.key</code>
         *
         * @param {Object} data
         *      The values for the template
         *
         * @return {String}
         *      The replaced template
         */
        alchemy.render = (function () {
            var cache = {};
            return function (template, data) {
                var key = template.replace(/[\s\t\n]/g, '');
                var tmplFn = cache[key];
                var str;
                var scopeVars;

                if (!tmplFn) {
                    str = template.replace(/\/\/(.*)$/mg, '') // remove line comments
                        .replace(/[\s\t\n]/g, ' ')
                        .replace(/\/\*(.*?)\*\//g, '') // remove block comments
                        .replace(/"/g, '\\"') // escape double quotes
                        .replace(/<\$=(.*?)\$>/g, '", $1, "')
                        .replace(/\$>/g, '; p.push("')
                        .replace(/<\$/g, '"); ');

                    // create the set of predefined closure scope variable for the template function
                    scopeVars = {
                        alchemy: alchemy,
                        tmplFn: undefined
                    };
                    // create the template function
                    tmplFn = beEvil([
                        'tmplFn = function (data) {',
                        '  var p = [];',
                        '  p.push("', str, '");',
                        '  return p.join("");',
                        '};'
                    ].join(''), scopeVars).tmplFn;
                    // and finally cache the new function for further uses
                    cache[key] = tmplFn;
                }

                return tmplFn(data);
            };
        }());

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
            var loadTime;
            if (isBrowser && window.performance && window.performance.now) {
                // use window.perfomance.now (which is the reference) if possible
                return function () {
                    return window.performance.now();
                };
            } else if (isNode && process.hrtime) {
                // The nodeJS solution process.hrtime() returns the current
                // high-resolution real time in a [seconds, nanoseconds] tuple
                // Array. It is relative to an arbitrary time in the past. It
                // is not related to the time of day and therefore not subject
                // to clock drift. The primary use is for measuring performance
                // between intervals.
                var getTime = function () {
                    var hrt = process.hrtime();
                    return hrt[0] * 1e6 + hrt[1] / 1000;
                };
                loadTime = getTime();
                return function () {
                    return getTime() - loadTime;
                };

            } else {
                // fallback to Date.now()
                loadTime = Date.now();
                return function () {
                    return Date.now() - loadTime;
                };
            }
        }());

        ///////////////////////////////////////////////////////////////////////////
        //
        // MODULE: path [section_path]
        //
        //

        /**
         * A submodule to handle the file paths of logical namespaces;
         * See description of submethods for further details
         *
         * @namespace
         * @property path
         * @type Object
         */
        alchemy.path = (function () {
            // paths for the core modules which have no namespace
            function getCorePaths() {
                return {
                    alchemy: '../../lib'
                };
            }
            var pathMap = getCorePaths();

            return {
                /**
                 * Resets the path configurations to the initial state
                 * @memberOf alchemy.path
                 */
                reset: function () {
                    pathMap = getCorePaths();
                },

                /**
                 * Returns the filepath to a given namespace
                 * @memberOf alchemy.path
                 *
                 * @param {String} ns
                 *      The name space
                 *
                 * @return {String}
                 *      The file path
                 *
                 * @memberOf alchemy.path
                 */
                map: function (ns) {
                    var parts = ns,
                    match,
                    result = [];

                    if (alchemy.isString(parts)) {
                        parts = parts.split('.');
                    }
                    if (!alchemy.isArray(parts)) {
                        throw '[ERROR] invalid namespace to map: ' + ns;
                    }
                    while (parts.length > 0) {
                        match = pathMap[parts.join('.')];
                        if (match) {
                            result.unshift(match);
                            break;
                        } else {
                            result.unshift(parts.pop());
                        }
                    }
                    return result.join('/');
                },

                /**
                 * Returns the configured path to a given namespace
                 * @memberOf alchemy.path
                 *
                 * @param {String} ns
                 *      Optional. The namespace; the paths of all packages are returned if missing
                 *
                 * @return {String/Object}
                 *      The path if a valid package is given
                 *      An Object with all paths if namespace is omitted
                 *      <code>undefined</code> the given namespace is unknown
                 */
                get: function (ns) {
                    return ns ? pathMap[ns] : pathMap;
                },

                /**
                 * Add new configurations or change existing ones
                 * @memberOf alchemy.path
                 *
                 * @param {Object} cfg
                 *      The name space cfg;
                 *      Each key represents a namespace and the value should be the path
                 *
                 * @memberOf alchemy.path
                 */
                set: function (cfg) {
                    pathMap = alchemy.mix(pathMap, cfg);
                }
            };
        }());


        ///////////////////////////////////////////////////////////////////////////
        //
        // MODULE: formula [section_formula]
        //
        //

        /**
         * A submodule for managing the formulas;
         * See module methods for further descriptions
         *
         * @namespace
         * @property formula
         * @type Object
         */
        alchemy.formula = (function () {
            // Loads a formula synchronously.
            // @private
            function load(name) {
                var url = alchemy.path.map(name) + '.js';
                var request;

                try {
                    if (alchemy.platform.isNode) {
                        require(url);
                    } else if (alchemy.platform.isBrowser) {
                        request = new XMLHttpRequest();
                        request.open('GET', url, false);
                        request.send(null);

                        if (request.status === 200 && request.responseText) {
                            /*jslint evil: true*/
                            eval(request.responseText);
                            /*jslint evil: false*/
                        }
                    }
                    return cache[name];
                } catch (e) {
                    return null;
                }
            }

            // helper method to traverse all registered formulas and add all dependencies
            // which may have to be resolved
            // @private
            function collectCandidates() {
                var candidates = [];
                alchemy.each(cache, function (def) {
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
                        for (var i = 0; i < def.ingredients.length; i++) {
                            candidates.push(def.ingredients[i].ptype);
                        }
                    }
                });
                return candidates;
            }

            // helper method to filter the possible canditates
            // @private
            function filterCandidates(candidates) {
                var dependencies = [];
                for (var i = 0; i < candidates.length; i++) {
                    var c = candidates[i];
                    if (alchemy.isString(c) && !alchemy.hop(cache, c) && dependencies.indexOf(c) < 0) {
                        dependencies.push(c);
                    }
                }
                return dependencies;
            }
            var cache = Object.create(null);

            return {
                /**
                 * Adds a new formula to the cache;
                 * A formula has to be an Object with at least the property "name";
                 * See {@link alchemy.brew} for more details on formulas
                 * @memberOf alchemy.formula
                 *
                 * @param {Object} formula
                 *      The formula to add
                 */
                add: function (formula) {
                    if (!alchemy.isObject(formula)) {
                        throw 'Invalid formula: ' + formula;
                    }
                    if (!formula.name) {
                        throw 'Missing required property "name"';
                    }
                    if (formula.alias) {
                        registerAlias(formula.alias, formula.name);
                    }
                    cache[formula.name] = formula;
                },

                /**
                 * Returns the formula to a given name; If there has no fomula with
                 * the name been chached yet it is going to be loaded; The loading
                 * mechanism works synchronously which is fine for node modules. But
                 * in browsers (though it works) you may want to chache the formulas
                 * in the production version
                 * @memberOf alchemy.formula
                 *
                 * @param {String} name
                 *      The name of the formula
                 *
                 * @return {Object}
                 *      The formula
                 */
                get: function (name) {
                    var result = cache[name];
                    if (!result) {
                        result = load(name);
                    }
                    if (!result) {
                        throw 'Cannot load formula: ' + name;
                    }
                    return result;
                },

                /**
                 * Returns the set of unresolve dependencies
                 * @function
                 * @memberOf alchemy.formula
                 *
                 * @return {Array}
                 */
                dependencies: (function () {
                    return function () {
                        return filterCandidates(collectCandidates());
                    };
                }()),

                /**
                 * Resolves the dependencies by loading the required formulas
                 * @memberOf alchemy.formula
                 *
                 * @param {Array} dependencies
                 *      An array of formula names to load;
                 *      If this initial set produces new dependencies then these will be loaded too
                 *
                 * @param {Function} callback
                 *      Callback method; executed if all dependencies are resolved;
                 */
                resolve: function (dependencies, callback, iteration) {
                    iteration = iteration >= 0 ? iteration : 0;

                    var size = dependencies.length;
                    var onLoad = function () { // callback for loading a single formula
                        size--;
                        if (size === 0) {
                            // all formulas of first batch loaded
                            // -> recalculate dependencies and load those too
                            alchemy.formula.resolve(alchemy.formula.dependencies(), callback, iteration + 1);
                        }
                    };

                    if (size > 0) {
                        if (iteration > 1000) {
                            throw 'Cannot resolve the following dependencies: "' + dependencies.join('", "') + '"';
                        } else {
                            alchemy.each(dependencies, function (formulaName) {
                                var scriptUrl = alchemy.path.map(formulaName) + '.js';
                                if (alchemy.platform.isBrowser) {
                                    var script = document.createElement('script');
                                    script.src = scriptUrl;
                                    script.onload = onLoad;
                                    document.head.appendChild(script);
                                } else if (alchemy.platform.isNode) {
                                    require(scriptUrl);
                                    onLoad();
                                }
                            });
                        }
                    } else {
                        // no further unresolved dependencies
                        // -> finish
                        if (alchemy.isFunction(callback)) {
                            callback();
                        }
                    }
                }
            };
        }());
    })();

    // use a second closure so "evaled" function cannot access the main closure scope
    (function () {
        beEvil = function (expr, vars) {
            var returnVars;
            if (vars && typeof vars === 'object') {
                returnVars = {};
                for (var key in vars) {
                    if (vars.hasOwnProperty(key)) {
                        expr = [
                            'var ',  key,  ' = vars.', key, ';',
                            expr,
                            'returnVars.', key, ' = ', key, ';'
                        ].join('');
                    }
                }
            }
            /*jshint evil: true*/
            eval(expr);
            /*jshint evil: false*/
            return returnVars;
        };
    })();
})();

