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

        // private helper method to register an alias
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
         *      the identifyer of the potion
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
            window.require = function () {
                // TODO:
                // * handling of different modules
                // * handling of file paths
                return alchemy;
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
        alchemy.version = '0.1.0';

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
         * prepares the framework (loads required sources)
         *
         * @param {Object} cfg
         *      The configuration object:
         *      <ul>
         *          <li><code>path</code>: Optional, a path configuration</li>
         *          <li><code>require</code>: Optional, a set of formulas to load</li>
         *          <li><code>onReady</code>: Optional, a callback executed when ready</li>
         *      </ul>
         */
        alchemy.heatUp = function (cfg) {
            cfg = cfg || {};
            cfg.onReady = cfg.onReady || alchemy.emptyFn;

            if (cfg.path) {
                alchemy.path.set(cfg.path);
            }

            var callback = function () {
                alchemy.formula.resolve(cfg.require || [], function () {
                    alchemy.isReady = true;
                    cfg.onReady();
                });
            };
            if (alchemy.platform.isBrowser && !alchemy.isReady) {
                document.addEventListener('DOMContentLoaded', callback);
            } else {
                callback();
            }
        };

        /**
         * checks if a given item is an object
         *
         * @param {Various} o
         *      the item to be checked
         *
         * @return {Boolean}
         *      <code>true</code> if the given item is an object
         */
        alchemy.isObject = function (o) {
            return o && typeof o === 'object' && !alchemy.isArray(o);
        };

        /**
         * checks if a given item is an array
         *
         * @param {Various} a
         *      the item to be checked
         *
         * @return {Boolean}
         *      <code>true</code> if the given item is an array
         */
        alchemy.isArray = function (a) {
            return Array.isArray(a);
        };

        /**
         * checks if a given item is a function
         *
         * @param {Various} f
         *      the item to be checked
         *
         * @return {Boolean}
         *      <code>true</code> if the given item is a function
         */
        alchemy.isFunction = function (f) {
            return typeof f === 'function';
        };

        /**
         * checks if a given item is a number
         *
         * @param {Various} n
         *      the item to be checked
         *
         * @return {Boolean}
         *      <code>true</code> if the given item is a number
         */
        alchemy.isNumber = function (n) {
            return typeof n === 'number' && !isNaN(n);
        };

        /**
         * checks if a given item is a string
         *
         * @param {Various} s
         *      the item to be checked
         *
         * @return {Boolean}
         *      <code>true</code> if the given item is a string
         */
        alchemy.isString = function (s) {
            return typeof s === 'string';
        };

        /**
         * Checks if the given item is a boolean
         *
         * @param {Various} b
         *      the value to check
         *
         * @return {Boolean}
         *      <code>true</code> if and only if the check is passed
         */
        alchemy.isBoolean = function (b) {
            return typeof b === 'boolean';
        };

        /**
         * Checks if the given value is defined
         *
         * @param {Various} x
         *      the value to check
         *
         * @return {Boolean}
         *      <code>true</code> if and only if the check is passed
         */
        alchemy.isDefined = function (x) {
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
         * @param {Object/Array} iterable
         *      the object to iterate through
         *
         * @param {Function} fn
         *      the callback function to be called for each item
         *
         * @param {Object} scope
         *      the execution scope for the callback function
         *
         * @param {Array} more
         *      optional; an addional set of arguments which will be passed to the
         *      callback function
         */
        alchemy.each = function (iterable, fn, scope, more) {
            var i;
            var key;
            var args = [null, null];

            if (alchemy.isDefined(more) && !alchemy.isArray(more)) {
                more = [more];
            }
            if (alchemy.isArray(more)) {
                args = args.concat(more);
            }
            if (alchemy.isArray(iterable)) {
                for (i = 0; i < iterable.length; i++) {
                    args[0] = iterable[i];
                    args[1] = i;
                    fn.apply(scope, args);
                }
            } else if (alchemy.isObject(iterable)) {
                for (key in iterable) {
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
         * alchemy.override(obj, {
         *      foo: function hocuspocus(_super) {
         *          // The "hocuspocus" is vital.
         *          // So alchemy will know it is a method to call with the reference of the overridden method
         *          // to get the actual subtype method
         *
         *          return function () {
         *              return _super.call(this) + ' - bar';
         *          };
         *      }
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
            function addProperty(prop, key, obj) {
                if (alchemy.isFunction(prop)) {
                    if (prop.name && prop.name.toLowerCase() === 'hocuspocus') {
                        // you said the magic words so you will get your reference to the overridden method
                        prop = prop(obj[key]);

                    }
                }
                obj[key] = prop;
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
         * Extract values of a specific propertiy from a given set of items
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
         * @param {String} propertiy
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
         * defines a new object property;
         * see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty
         */
        alchemy.defineProperty = function (obj, prop, opts) {
            //console.log('Alchemy.defineProperty', obj, prop, opts);
            if (opts && opts.meta) {
                prop = alchemy.metaPrefix + prop;
            }
            return Object.defineProperty(obj, prop, opts);
        };

        /**
         * Defines a getter method for a given property; This will also add the
         * getter to the given object so it can be overridden
         *
         * @param {Object} obj The obj to be extended
         * @param {String} prop The property name
         * @param {Function} getter Optional. The getter method; If omitted it will be checked
         *      if the given object already has a correctly named (e.g. getProp) method or a
         *      new getter method will be created that uses a "private" object variable (e.g.
         *      _prop)
         *
         * @example
         * alchemy.defineGetter(obj, 'id', myGetter); // adds obj.getId = myGetter to obj
         */
        alchemy.defineGetter = function (obj, prop, getter) {
            var getterName = 'get' + prop.charAt(0).toUpperCase() + prop.substr(1, prop.length);
            var privateProp = '_' + prop;

            getter = getter || obj[getterName] || function () {
                return this[privateProp];
            };
            alchemy.defineProperty(obj, prop, {
                configurable: true,
                enumerable: true,
                get: function () {
                    return this[getterName]();
                }
            });
            if (obj[getterName] !== getter) {
                var overrides = {};
                overrides[getterName] = getter;
                alchemy.override(obj, overrides);
            }
        };

        /**
         * Defines a setter method for a given property; This will also add the
         * setter to the given object so it can be overridden
         *
         * @param {Object} obj The obj to be extended
         * @param {String} prop The property name
         * @param {Function} setter Optional. The setter method; If omitted it will be checked
         *      if the given object already has a correctly named (e.g. setProp) method or a
         *      new setter method will be created that uses a "private" object variable (e.g.
         *      _prop)
         *
         * @example
         * alchemy.defineSetter(obj, 'id', mySetter); // adds obj.setId = mySetter to obj
         */
        alchemy.defineSetter = function (obj, prop, setter) {
            var setterName = 'set' + prop.charAt(0).toUpperCase() + prop.substr(1, prop.length);
            var privateProp = '_' + prop;
            var overrides;

            setter = setter || obj[setterName] || function (newVal) {
                this[privateProp] = newVal;
                return newVal;
            };

            alchemy.defineProperty(obj, prop, {
                configurable: true,
                enumerable: true,
                set: function (newVal) {
                    return this[setterName](newVal);
                }
            });

            if (obj[setterName] !== setter) {
                overrides = {};
                overrides[setterName] = setter;
                alchemy.override(obj, overrides);
            }
        };

        /**
         * brews a new prototype based on the given ingredients
         *
         * @param {object} typeDef
         *      the type definition configuration; accepted properties are:
         *      <ul>
         *          <li>
         *              <code>extend</code> {Object} the prototype that should
         *              be extended
         *          </li>
         *          <li>
         *              <code>name</code> {String} the name under which the new
         *              type should be registered in the given namespace;
         *              NOTICE: This may overwrite existing type definitions!
         *          </li>
         *          <li>
         *              <code>ns</code> {String} the types namespace
         *          </li>
         *      </ul>
         *
         * @param {object} overrides
         *      a set of properties and methods the new prototype should get
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
                alchemy.each(includes, function (cfg) {
                    NewType.addIngredient(cfg.key, cfg.ptype);
                });
            }
            if (overrides) {
                alchemy.override(NewType, overrides);
            }
            meta.push(['supertype', SuperType]);
            alchemy.each(meta, function (metaAttr) {
                NewType.meta(metaAttr[0], metaAttr[1]);
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
         },
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
                resolve: function (dependencies, callback) {
                    var size = dependencies.length;
                    var onLoad = function () { // callback for loading a single formula
                        size--;
                        if (size === 0) {
                            // all formulas of first batch loaded
                            // -> recalculate dependencies and load those too
                            alchemy.formula.resolve(alchemy.formula.dependencies(), callback);
                        }
                    };

                    if (size > 0) {
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

