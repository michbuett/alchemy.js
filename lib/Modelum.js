module.exports = (function () {
    'use strict';

    var each = require('pro-singulis');
    var Observari = require('./Observari');
    var utils = require('./Alchemy.js');

    /**
     * A potion to represent data (a model)
     *
     * @class
     * @name alchemy.core.Modelum
     * @extends alchemy.core.Oculus
     */
    return Observari.extend({
        /** @lends alchemy.core.Modelum */

        /**
         * The storage object for the data values.
         * Do not modify this object after creation use {@link #get} and
         * {@link set}
         *
         * @property data
         * @type undefined
         * @private
         */
        data: undefined,

        /**
         * Returns the stored values to a given key
         *
         * @param {String} key
         *      The attributebute key;
         *
         * @return Mixed
         *      The store value for the given key
         */
        get: function (key) {
            return this.data[key];
        },

        /**
         * Returns the stored data of all attributes
         * This method returns always an object
         *
         * @return Object
         *      The data object
         */
        toData: function () {
            return utils.mix({}, this.data);
        },

        /**
         * Set the data values
         * If the data changed an "change" is fired
         *
         * @param {Mixed} key
         *      Either the name of an attribute to be changed
         *      or an object with new values
         *
         * @param {Mixed} value
         *      The new data value (only if first parameter is an
         *      actual key)
         */
        set: (function () {
            var eventData = {};
            var changed;
            var set = function (value, key) {
                var oldVal = this.data[key];
                if (oldVal !== value) {
                    // notice that a single change has been made
                    changed = true;
                    // update the data store
                    this.data[key] = value;
                    // trigger an event for the change
                    eventData.model = this;
                    eventData.oldVal = oldVal;
                    eventData.newVal = value;
                    this.trigger('change.' + key, eventData);
                }
            };

            return function (key, value) {
                changed = false;
                if (utils.isObject(key)) {
                    each(key, set, this);
                } else {
                    set.call(this, value, key);
                }
                if (changed) {
                    this.trigger('change', {
                        model: this
                    });
                }
            };
        }())

    }).whenBrewed(function () {
        this.data = this.data || {};
    });
}());
