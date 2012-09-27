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
                throw 'Cannot load formula: ' + name;
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
     * The configuration:
     * <ul>
     *      <li><code>root</code>: The root path for loading formulas</li>
     * </ul>
     */
    alchemy.cfg = {
        root: '..'
    };

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
        var i, j,
        path,
        files,
        src;

        // apply defaults
        cfg = cfg || {};
        cfg.sources = cfg.sources || [{
            path: this.sourceRoot,
            files: this.sourceFiles
        }];
        cfg.root = cfg.root || '';
        // load sourced
        for (i = 0; i < cfg.sources.length; i++) {
            path = cfg.root + cfg.sources[i].path;
            files = cfg.sources[i].files;
            for (j = 0; j < files.length; j++) {
                src = path + files[j];
                /*jslint evil: true*/
                document.write('<script type="text/javascript" src="' + src + '"></script>');
                /*jslint evil: false*/
            }
        }
        // call onReady callback if script is ready
        if (alchemy.isFunction(cfg.onReady)) {
            if (alchemy.isReady) {
                cfg.onReady.call();
            } else {
                document.addEventListener('DOMContentLoaded', function () {
                    cfg.onReady.call();
                    alchemy.isReady = true;
                });
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
        return typeof n === 'number';
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
     * @param {Object} args
     *      optional; an argument which will be passed as an argument to the 
     *      callback function
     */
    alchemy.each = function (iterable, fn, scope, args) {
        var i, key;
        if (alchemy.isArray(iterable)) {
            for (i = 0; i < iterable.length; i++) {
                fn.call(scope, iterable[i], i, args);
            }
        } else if (alchemy.isObject(iterable)) {
            for (key in iterable) {
                if (iterable.hasOwnProperty(key)) {
                    fn.call(scope, iterable[key], key, args);
                }
            }
        }
    };

    /**
     * mixes the given additives to the source object
     *
     * @param {Object} base
     *      the source object
     *
     * @param {Object} additive
     *      the set of additives
     *
     * @param {object} options
     *      a set of options; the following properties are accepted:
     *      <ul>
     *          <li>
     *              <code>all</code> {boolean} if set to <code>true</code>
     *              the inherited properties will be added too (defaults to
     *              <code>false</code>)
     *          </li>
     *          <li>
     *              <code>copyConstructor</code> {boolean} if set to <code>true
     *              </code> the constructor method will be copied too (defaults 
     *              to <code>false</code>
     *          </li>
     *          <li>
     *              <code>override</code> {boolean} if set to <code>true</code>
     *              the source properties will be overwritten even if they are
     *              already defined (defaults to <code>true</code>)
     *          </li>
     *          <li>
     *              <code>linkMethods</code> {boolean} if set to <code>true</code>
     *              all methods will be assigned using the {@link #addMethod}
     *              function (defaults to <code>false</code>
     *          </li>
     *      </ul>
     *
     *  @return Object
     *      the modified source object
     */
    alchemy.mix = function (base, additive, options) {
        var override = !options || (options.override !== false),
        allProps = options && (options.all === true),
        cpConstr = options && (options.copyConstructor === true),
        linkMethods = options && (options.linkMethods === true),
        key,
        value;

        //console.log('Alchemy.mix', base, additive, override, allProps, cpConstr);
        if (cpConstr && additive.constructor !== Object.prototype.constructor) {
            alchemy.addMethod(base, 'constructor', additive.constructor);
        }
        /*jslint forin: true */
        for (key in additive) {
            if (additive.hasOwnProperty(key) || allProps) {
                if (override || base[key] === undefined) {
                    value = additive[key];
                    if (linkMethods && alchemy.isFunction(value)) {
                        alchemy.addMethod(base, key, value);
                    } else {
                        base[key] = value;
                    }
                }
            }
        }
        /*jslint forin: false */
        return base;
    };

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
        var SuperType = typeDef.extend || alchemy('core.MateriaPrima'),
        name = typeDef.name,
        includes = typeDef.ingredients,
        overrides = typeDef.overrides,
        NewType,
        meta = [],
        i;

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
            alchemy.mix(NewType, overrides, {
                copyConstructor: true,
                linkMethods: true
            });
        }
        meta.push(['supertype', SuperType]);
        alchemy.each(meta, function (metaAttr) {
            NewType.setMetaAttr(metaAttr[0], metaAttr[1]);
        });
        return NewType;
    };

    /**
     * Adds a method to an object
     *
     * @param {Object} object
     *      the object that should get the method
     *
     * @param {String} name
     *      the name where to add the new method
     *
     * @param {Function} method
     *      the function object to be added
     */
    alchemy.addMethod = function (object, name, method) {
        var pre = alchemy.metaPrefix;
        if (alchemy.isFunction(object.addMethod)) {
            // obj inherits from basic type
            object.addMethod(name, method);
        } else {
            // obj inherits from Object
            method[pre + 'name'] = name;
            method[pre + 'owner'] = object;
            object[name] = method;
        }
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
        var re = /^function.*\(.*\).*\{/,
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
            function (callback, element) {
            window.setTimeout(callback, 16.666);
        };
    }()).bind(window);

    /**
     * an reuseable empty function object
     */
    alchemy.emptyFn = function () {};

    /**
     * Loads a formual synchronously.
     */
    alchemy.loadFormula = function (name) {
        var url = alchemy.cfg.root + '/' + name.replace(/\./g, '/') + '.js',
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

