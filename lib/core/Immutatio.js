(function () {
    'use strict';

    var alchemy = require('./Alchemy.js');

    /**
     * This is an immutable data object
     *
     * @class
     * @name alchemy.core.Immutatio
     * @extends alchemy.core.MateriaPrima
     */
    alchemy.formula.add({
        name: 'alchemy.core.Immutatio',
        alias: 'Immutatio',
        extend: 'alchemy.core.MateriaPrima',
        overrides: function (_super) {

            /**
             * A simple immutable value
             *
             * @class
             * @private
             */
            function Value(val) {
                this.value = val;
            }

            Value.prototype.val = function _getSimpleValue() {
                return this.value;
            };

            Value.prototype.set = function _setSimpleValue(val) {
                if (val === this.value) {
                    return this;
                }
                return new Value(val);
            };

            /**
             * @class Struct
             * @private
             */
            function Struct(data) {
                this._keys = [];

                alchemy.each(data, function (value, key) {
                    if (alchemy.isObject(value)) {
                        if (value instanceof Struct || value instanceof Value) {
                            this[key] = value;
                        } else {
                            this[key] = new Struct(value);
                        }
                    } else {
                        this[key] = new Value(value);
                    }
                    this._keys.push(key);
                }, this);
            }

            Struct.prototype.find = function _getComplexSub(key) {
                if (typeof key !== 'undefined') {
                    return this[key];
                }
                return this;
            };


            Struct.prototype.val = function _getComplexValues() {
                var data = {};
                alchemy.each(this._keys, function (key) {
                    if (this[key]) {
                        data[key] = this[key].val();
                    }
                }, this);
                return data;
            };

            Struct.prototype.set = function _setComplexValue(key, val) {
                var changed = false;
                var newData = {};
                var setSingleValue = function (val, key) {
                    if (this[key]) { // update existing key
                        newData[key] = this[key].set(val);
                        changed = changed || newData[key] !== this[key];
                    } else { // add new key/value
                        changed = true;
                        newData[key] = val;
                    }
                };

                if (alchemy.isObject(key)) {
                    alchemy.each(key, setSingleValue, this);
                } else {
                    setSingleValue.call(this, val, key);
                }

                if (changed) {
                    return new Struct(alchemy.mix(this.val(), newData));
                }
                return this;
            };

            return {
                /** @lends alchemy.core.Immutatio.prototype */

                constructor: function (cfg) {
                    var overrides = {};
                    var data = {};

                    alchemy.each(cfg, function (value, key) {
                        if (key === 'id' || alchemy.isFunction(value)) {
                            overrides[key] = value;
                            return;
                        }
                        data[key] = value;
                    }, this);

                    this.data = this.createStruct(data);
                    _super.constructor.call(this, overrides);
                },

                createStruct: function (data) {
                    return new Struct(data);
                },

                get: function get(key) {
                    var data = this.data.find(key);
                    if (data) {
                        return data.val();
                    }
                    return null;
                },

                set: function (key, value) {
                    var newData = this.data.set(key, value);
                    if (newData === this.data) {
                        return this;
                    }

                    var newImmutableData = this.brew();
                    newImmutableData.data = newData;
                    return newImmutableData;
                },
            };
        }
    });

}());
