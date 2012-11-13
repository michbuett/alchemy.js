/*
 * Copyright (C) 2012 Michael Büttner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * The Software shall not be used for discriminating or manipulating people.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function () {
    'use strict';

    var formulas = {};
    var potions = {};

   /**
     * The main units of alchemy.js are the "potions" of course. They are the javascript prototypes which can be
     * used to create other instances. Each potions provides a <code>create</code> method.
     *
     * The function returns the respective potion. If there has no potion with this name been created yet then it
     * will be brewed based on the available formuals. If no such formula is available then alchemy will try
     * loading one (this works synchronusly!).
     *
     * @param {String} potionName
     *      the identifyer of the potion
     *
     * @return Object
     *      the potion
     */
    var alchemy = function (potionName) {
        var potion = potions[potionName];
        if (!potion) {
            var formula = formulas[potionName];
            if (!formula) {
                formula = alchemy.loadFormula(potionName);
            }
            if (!formula) {
                throw 'Cannot load formula: ' + potionName;
            } else {
                potion = alchemy.brew(formula);
            }
        }
        return potion;
    };

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
        isBrowser: typeof window === 'object',
        isNode: typeof require === 'function'
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

    /**
     * A submodule to handle the file paths of logical namespaces; See description
     * of submethods for further details
     *
     * @property path
     * @type Object
     */
    alchemy.path = (function () {
        var core = '../../lib/core';
        var pathMap = {
            // core modules
            Ingredient: core + '/Ingredient',
            MateriaPrima: core + '/MateriaPrima',
            Oculus: core + '/Oculus'
        };

        return {
            /**
             * Returns the filepath to a given namespace
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
             */
            get: function (ns) {
                return pathMap[ns];
            },

            /**
             * Add new configurations or change existing ones
             *
             * @param {Object} cfg
             *      The name space cfg; Each key represents a namespace and the value should be the path
             *
             * @memberOf alchemy.path
             */
            set: function (cfg) {
                pathMap = alchemy.mix(pathMap, cfg);
            }
        };
    }());

    /**
     * provides keyboard properties (incl. keyboard events and key codes)
     *
     * @property kb
     * @type Object
     */
    alchemy.kb = {
        events: ['keypress', 'keydown', 'keyup'],

        KEY_ENTER: 13
    };

    /**
     * prepares the framework (loads required sources)
     * TODO: migrate to new formula-pattern
     */
    alchemy.heatupCauldron = function (cfg) {
        var callback;

        if (alchemy.isFunction(cfg.onReady)) {
            // call onReady callback if script is ready
            callback = function () {
                alchemy.isReady = true;
                cfg.onReady();
            };
            if (alchemy.platform.isBrowser && !alchemy.isReady) {
                document.addEventListener('DOMContentLoaded', callback);
            } else {
                callback();
            }
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
                if (iterable.hasOwnProperty(key)) {
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
     * alchemy.override(obj, {
     *      foo: function () {
     *          return _super.call(this) + ' - bar';
     *      }
     * });
     * obj.foo(); // will return 'foo - bar'
     * </code></pre>
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
        function getSuperStack(obj, key) {
            var pre = alchemy.metaPrefix;
            var overrideKey = pre + 'overridden';

            if (!obj[overrideKey]) {
                obj[overrideKey] = Object.create(null);
            }
            if (!alchemy.isArray(obj[overrideKey][key])) {
                obj[overrideKey][key] = [];
            }
            return obj[overrideKey][key];
        }

        function addMethod(fn, key, obj) {
            var pre = alchemy.metaPrefix;
            var superStack;
            var superFn = obj[key];
            var superIndex;

            if (alchemy.isFunction(fn)) {
                if (fn[pre + 'owner']) {
                    fn = alchemy.cloneFn(fn);
                }
                if (alchemy.isFunction(superFn)) {
                    // add reference to super method
                    superStack = getSuperStack(obj, key);
                    superIndex = superStack.indexOf(superFn);
                    if (superIndex < 0) {
                        superStack.push(superFn);
                        superIndex = superStack.length - 1;
                    }
                    // inject local variable "_super" that stores the reference to the super method
                    fn = alchemy.infect(fn, [
                        'var _super = this.', pre, 'overridden.', key, '[', superIndex, '];'
                    ].join(''));
                }
                fn[pre + 'name'] = key;
                fn[pre + 'owner'] = obj;
            }
            obj[key] = fn;
        }

        return function (base, overrides) {
            if (overrides.constructor !== Object.prototype.constructor) {
                addMethod(overrides.constructor, 'constructor', base);
            }
            alchemy.each(overrides, addMethod, null, [base]);
            return base;
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
     * Registers a formula that can be used to brew potions
     *
     * @param {Object} typeDef
     *      The type (potion) specification (see {@link alchemy.brew} for details)
     */
    alchemy.addFormula = function (typeDef) {
        formulas[typeDef.name] = typeDef;
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
        var SuperType = typeDef.extend || alchemy('MateriaPrima'),
        name = typeDef.name,
        includes = typeDef.ingredients,
        overrides = typeDef.overrides,
        NewType,
        meta = [];

        if (alchemy.isString(SuperType)) {
            SuperType = alchemy(SuperType);
        }
        NewType = Object.create(SuperType);

        if (name) {
            // register new type in global namespace
            potions[name] = NewType;
            meta.push(['name', name]);
        }
        if (includes) {
            // enhance new prototype with given ingredients (mixins)
            alchemy.each(includes, function (cfg) {
                NewType.addIngredient(cfg.key, cfg.ptype);
            });
        }
        if (typeDef.vtype) {
            // register view at view factory
            alchemy.v.Factory.registerView(typeDef.vtype, NewType);
        }
        if (overrides) {
            alchemy.override(NewType, overrides);
        }
        meta.push(['supertype', SuperType]);
        alchemy.each(meta, function (metaAttr) {
            NewType.setMetaAttr(metaAttr[0], metaAttr[1]);
        });
        return NewType;
    };

    /**
     * Creates a new function object that returns the same value as the
     * original one
     *
     * @param {Function} fn
     *    The origin
     *
     * @return {Function}
     *    the clone
     */
    alchemy.cloneFn = function (fn) {
        var clone;
        try {
            /*jslint evil: true */
            eval("clone = " + fn.toString());
            /*jslint evil: false */
        } catch (e) {
            clone = function () {
                fn.apply(this, arguments);
            };
        }
        return clone;
    };

    /**
     * Creates a new function with the same functionality as the origin plus
     * the injected code
     *
     * @param {Function} f
     *      the origin function object (will NOT be modified)
     *
     * @param {String} code
     *      the code block to be injected; The injected code will be executed first;
     *      !!! Make sure to close any statment with ";" !!!
     *
     * @return {Function}
     *      the modified function
     */
    alchemy.infect = function (f, code) {
        /*jshint regexp: false*/
        var re = /^function.*\(.*\).*\{/,
        /*jshint regexp: true*/
            fs = f.toString(),
            fHead = f.toString().match(re)[0],
            result;
        /*jslint evil: true */
        eval('result = ' + fs.replace(fHead, fHead + code));
        /*jslint evil: false */
        return result;
    };

    /**
     * creates a unique identifier
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
     * @param {Function} callback
     * @param {HTMLElement} element
     */
    alchemy.reqAnimFrame = typeof window === 'undefined' ? function () {} : (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 16.666);
            };
    }()).bind(window);

    /**
     * an reuseable empty function object
     */
    alchemy.emptyFn = function () {};

    /**
     * Maps the name of a formula to the actual filename.
     * NOTICE:
     *  - This is supposed to be an internal helper method. In general there should be no need to use the method
     *  explicitly. You can access potions by <code>alchemy('myNamspace.myFormula')</code>
     *  - There is no check if the file atually exists.
     *
     * @param {String} formula
     *      The fully qualified formula name (e.g.: 'MateriaPrima')
     *
     * @return {String}
     *      The corresponding filename.
     */
    alchemy.getFile = function (formula) {
        return alchemy.path.map(formula) + '.js';
    };

    /**
     * Loads a formual synchronously.
     * NOTICE:
     *  - This is supposed to be an internal helper method. In general there should be no need to use the method
     *  explicitly. You can access potions by <code>alchemy('myNamspace.myFormula')</code>
     */
    alchemy.loadFormula = function (name) {
        var url = alchemy.getFile(name),
            request;

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
        return formulas[name];
    };

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

            if (!tmplFn) {
                str = template.replace(/[\s\t\n]/g, ' ');
                str = str.replace(/"/g, '\\"');
                str = str.replace(/<\$=(.*?)\$>/g, '", $1, "');
                str = str.replace(/\$>/g, '; p.push("');
                str = str.replace(/<\$/g, '"); ');

                /*jshint evil: true, white: false*/
                eval([
                    'tmplFn = function (data) {',
                        'var p = [];',
                        'p.push("', str, '");',
                        'return p.join("");',
                    '};'
                ].join(''));
                /*jshint evil: false, white: true*/
                cache[key] = tmplFn;
            }

            return tmplFn(data);
        };
    }());

    if (alchemy.platform.isNode) {
        module.exports = alchemy;
    } else if (alchemy.platform.isBrowser) {
        window.require = function () {
            // TODO:
            // * handling of different modules
            // * handling of file paths
            return alchemy;
        };
    }
}());

