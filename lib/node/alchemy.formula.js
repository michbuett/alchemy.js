'use strict';

module.exports = function (alchemy) {
    return function (FormulaModule) {

        return {
            /**
             * Returns the formula to a given name; If there has no formula with
             * the name been cached yet it is going to be loaded (nodejs only!)
             *
             * @param {String} name The name of the formula
             * @return {Object} The formula
             */
            get: function (name) {
                var result = FormulaModule.get.call(this, name);
                if (result) {
                    return result;
                }

                var url = alchemy.path.map(name) + '.js';
                var module = require(url);
                if (alchemy.isFunction(module)) {
                    module(alchemy);
                }

                return this.cache[name];
            },
        };
    };
};
