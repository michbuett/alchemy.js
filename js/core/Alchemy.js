/*global process, exports, window, require*/
var gbl, exp;
if (typeof process === 'undefined') {
    gbl = window;
} else {
    gbl = process;
    exp = exports;
}

(function (gbl, exports) {
    var alchemy = {
        /**
         * the current version of the framework; read-only
         *
         * @property version
         * @type String
         */
        version: '0.1.0',

        /**
         * the prefix for internal type and method meta properties
         *
         * @property metaPrefix
         * @type String
         */
        metaPrefix: '_AJS_',

        /**
         * <code>true</code> if and only if the all required sources are loaded
         * and the dom tree is ready for manipulation; read-only
         *
         * @property isReady
         * @type Boolean
         */
        isReady: false,

        /**
         * the default source path
         *
         * @property sourceRoot
         * @type String
         */
        sourceRoot: 'Alchemy/',

        /**
         * the default set of source file which are loaded if the cauldron
         * is heated
         *
         * @property sourceFiles
         * @type Array
         */
        sourceFiles: [
            'core/Alchemy.js',
            'core/MateriaPrima.js',
            'core/Ingredient.js',
            'core/Oculus.js',
            'core/Application.js',
            'util/Observable.js',
            'util/Servant.js',
            'util/Sequencer.js',
            'util/MeanValue.js',
            'util/ResourceMgr.js',
            'util/Gfx.js',
            'util/PerformanceTest.js',
            'c/Controller.js',
            'm/Model.js',
            'v/Factory.js',
            'v/BasicElement.js',
            'v/BasicContainer.js',
            'v/DomHelper.js',
            'v/DomElement.js',
            'v/DomContainer.js',
            'v/CvsElement.js',
            'v/CvsContainer.js',
            'v/Animation.js',
            'v/AnimatedEl.js',
            'v/Viewport.js',
            'v/LoadMask.js',
            'v/SpriteSheet.js'
        ],

        /**
         * provides keyboard properties (incl. keyboard events and key codes)
         *
         * @property kb
         * @type Object
         */
        kb: {
            events: ['keypress', 'keydown', 'keyup'],

            KEY_ENTER: 13
        },

        /**
         * prepares the framework (loads required sources)
         */
        heatupCauldron: function (cfg) {
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
        },

        /**
         * checks if a given item is an object
         *
         * @param {Various} o
         *      the item to be checked
         *
         * @return {Boolean}
         *      <code>true</code> if the given item is an object
         */
        isObject: function (o) {
            return o && typeof o === 'object' && !alchemy.isArray(o);
        },

        /**
         * checks if a given item is an array
         *
         * @param {Various} a
         *      the item to be checked
         *
         * @return {Boolean}
         *      <code>true</code> if the given item is an array
         */
        isArray: function (a) {
            return Array.isArray(a);
        },

        /**
         * checks if a given item is a function
         *
         * @param {Various} f
         *      the item to be checked
         *
         * @return {Boolean}
         *      <code>true</code> if the given item is a function
         */
        isFunction: function (f) {
            return typeof f === 'function';
        },

        /**
         * checks if a given item is a number
         *
         * @param {Various} n
         *      the item to be checked
         *
         * @return {Boolean}
         *      <code>true</code> if the given item is a number
         */
        isNumber: function (n) {
            return typeof n === 'number';
        },

        /**
         * checks if a given item is a string
         *
         * @param {Various} s
         *      the item to be checked
         *
         * @return {Boolean}
         *      <code>true</code> if the given item is a string
         */
        isString: function (s) {
            return typeof s === 'string';
        },

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
        each: function (iterable, fn, scope, args) {
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
        },

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
        mix: function (base, additive, options) {
            var override = !options || (options.override !== false),
                allProps = options && (options.all === true),
                cpConstr = options && (options.copyConstructor === true),
                linkMethods = options && (options.linkMethods === true),
                key,
                value;

            //console.log('Alchemy.mix', base, additive, override, allProps, cpConstr);
            if (cpConstr && additive.constructor !== Object.prototype.constructor) {
                alchemy.addMethod(base, 'constructor', additive.constructor);
                delete additive.constructor;
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
        },

        /**
         * defines a new object property;
         * see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/defineProperty
         */
        defineProperty: function (obj, prop, opts) {
            //console.log('Alchemy.defineProperty', obj, prop, opts);
            if (opts && opts.meta) {
                prop = alchemy.metaPrefix + prop;
            }
            return Object.defineProperty(obj, prop, opts);
        },

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
        brew: function (typeDef, overrides) {
            var SuperType = typeDef.extend || alchemy.MateriaPrima,
                ns = (typeof typeDef.ns === 'string') ? alchemy.ns(typeDef.ns) : null,
                typeName = typeDef.name,
                includes = typeDef.ingredients,
                ingredients,
                NewType,
                meta = [],
                i;

            NewType = Object.create(SuperType);

            if (ns && typeName) {
                // register new type in global namespace
                meta.push(['name', typeName], ['ns', typeDef.ns]);
                ns[typeName] = NewType;
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
                    copyConstructor: true
                });
            }
            meta.push(['supertype', SuperType]);
            alchemy.each(meta, function (metaAttr) {
                NewType.setMetaAttr(metaAttr[0], metaAttr[1]);
            });
            return NewType;
        },

        /**
         * creates an instance to a given prototype
         *
         * @param {Object} cfg
         *      the instance configuration; it has to have the property
         *      <code>ptype</code> to determine the prototype
         *
         * @return {Object}
         *      the new instance
         */
        create: function (cfg) {
            var result,
                ptype = cfg.ptype;
            if (alchemy.isString(ptype)) {
                ptype = alchemy.ns(ptype);
            }
            if (alchemy.isFunction(ptype.create)) {
                result = ptype.create(cfg);
            } else if (alchemy.isObject(ptype)) {
                result = Object.create(ptype);
            } else {
                throw 'Invalid prototype: ' + ptype;
            }
            return result;
        },

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
        addMethod: function (object, name, method) {
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
        },

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
        cloneFn: function (fn) {
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
        },

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
        infect: function (f, code) {
            var re = /^function.*\(.*\).*\{/,
                fs = f.toString(),
                fHead = f.toString().match(re)[0],
                result;
            /*jslint evil: true */
            eval('result = ' + fs.replace(fHead, fHead + code));
            /*jslint evil: false */
            return result;
        },

        /**
         * creates a namespace
         *
         * @param {String} namespace
         *      the namespace
         *
         * @return Object
         *      the namespace container object
         */
        ns: function (namespace) {
            var ns = namespace.split('.');
            var current = gbl;
            ns.forEach(function (key) {
                if (typeof current[key] !== 'object') {
                    current[key] = {};
                }
                current = current[key];
            });
            return current;
        },

        /**
         * creates a unique identifier
         *
         * @return {String}
         *      the generated identifier
         *
         */
        id: (function () {
            var counter = 0;
            return function () {
                return 'AJS-' + (counter++);
            };

        }()),

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
        random: function (max, min) {
            min = typeof min === 'number' ? min : 0;
            return Math.floor(Math.random() * (max - min + 1) + min);
        },

        /**
         * @param {Function} callback
         * @param {HTMLElement} element
         */
        reqAnimFrame: (function () {
            return gbl.requestAnimationFrame ||
                gbl.webkitRequestAnimationFrame ||
                gbl.mozRequestAnimationFrame ||
                gbl.oRequestAnimationFrame ||
                gbl.msRequestAnimationFrame ||
                function (callback, element) {
                    gbl.setTimeout(callback, 16.666);
                };
        }()).bind(gbl),

        /**
         * an reuseable empty function object
         */
        emptyFn: function () {}
    };

    if (typeof require === 'function') {
        // node.js
        alchemy.mix(exp, alchemy);
    } else {
        // browser
        gbl.Alchemy = alchemy;
        gbl.require = function () {
            // TODO:
            // * handling of different modules
            // * handling of file paths
            return alchemy;
        };
    }
}(gbl, exp));

