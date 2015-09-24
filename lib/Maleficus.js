(function () {
    'use strict';

    var beEvil = (function () {
        return function beEvil(expr, vars) {
            var returnVars = {};

            for (var key in vars) {
                expr = [
                    'var ',  key,  ' = vars.', key, ';',
                    expr,
                    'returnVars.', key, ' = ', key, ';'
                ].join('');
            }

            /*jshint evil: true*/
            eval(expr);
            /*jshint evil: false*/

            return returnVars;
        };
    }());

    module.exports = (function () {

        var alchemy = require('./Utils');
        var cache = {};

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
         * @param {String} template Well, the template...
         *      You can reference values by <code>data.key</code>
         * @param {Object} data The values for the template
         * @return {String} The replaced template
         */
        return function render(template, data) {
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
}());
