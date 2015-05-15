'use strict';

module.exports = function (alchemy) {
        return {

            /**
             * Returns the formula to a given name; If there has no formula with
             * the name been cached yet it is going to be loaded (nodejs only!)
             * @memberOf alchemy.formula
             *
             * @param {String} name The name of the formula
             * @return {Object} The formula
             */
            get: alchemy.override(function (_super) {
                return function (name) {
                    var result = _super(name);
                    if (result) {
                        return result;
                    }

                    var url = alchemy.path.map(name) + '.js';
                    var module = require(url);
                    if (alchemy.isFunction(module)) {
                        module(alchemy);
                    }

                    return _super(name);
                };
            }),
        };
};
