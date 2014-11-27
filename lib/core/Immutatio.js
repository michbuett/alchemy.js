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
             * Helper to create an immutable data object depending on the type of the input
             * @private
             */
            function createSub(value) {
                if (alchemy.isArray(value)) {
                    return new List(value);
                } else if (alchemy.isObject(value)) {
                    if (value instanceof Value || value instanceof Struct || value instanceof List) {
                        return value;
                    } else if (value.constructor === Object) {
                        return new Struct(value);
                    }
                    return new Value(value);
                }
                return new Value(value);
            }

            function Abstract(value, data) {
                this.value = value;
                this.data = data && alchemy.each(data, function (item) {
                    return createSub(item);
                });
            }

            Abstract.prototype.val = function () {
                return this.value || alchemy.each(this.data, function (sub) {
                    return sub.val();
                });
            };

            Abstract.prototype.set = alchemy.emptyFn;

            Abstract.prototype.sub = function (key) {
                return (this.data && this.data[key]) || null;
            };

            Abstract.prototype.setSubValue = function (val, key) {
                var currVal = this.sub(key);
                if (currVal) {
                    // update existing key
                    var newVal = currVal.set(val);
                    if (newVal !== currVal) {
                        return newVal;
                    }
                } else {
                    // add new key/value
                    return createSub(val);
                }
            };

            /**
             * A simple immutable value
             *
             * @class
             * @private
             */
            function Value(val) {
                Abstract.call(this, val);
            }
            Value.prototype = new Abstract();

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
                Abstract.call(this, null, data);

                this._keys = [];

                alchemy.each(data, function (value, key) {
                    this[key] = createSub(value);
                    this._keys.push(key);
                }, this);
            }
            Struct.prototype = new Abstract();

            Struct.prototype.set = function _setComplexValue(key, val) {
                if (alchemy.isString(key) && typeof val !== 'undefined') {
                    // called with key and value, e.g. .set('foo', 'bar');
                    var newSub = this.setSubValue(val, key);
                    if (newSub) {
                        var newData = alchemy.mix({}, this.data);
                        newData[key] = newSub;
                        return new Struct(newData);
                    }
                    return this;
                }

                if (alchemy.isArray(key)) {
                    // called with array, e.g. .set([1, 2, ...]);
                    return new List(key);
                }

                if (alchemy.isObject(key) && key.constructor === Object) {
                    // called with raw js object, e.g. .set({foo: 'bar'});
                    var changedSubs = alchemy.each(key, this.setSubValue, this);
                    if (changedSubs && Object.keys(changedSubs).length > 0) {
                        return new Struct(alchemy.mix({}, this.data, changedSubs));
                    }
                    return this;
                }

                if (key) {
                    return new Value(key);
                }

                return this;
            };

            function List(data) {
                this.data = alchemy.each(data, function (value, key) {
                    return createSub(value);
                }, this);
            }
            List.prototype = new Abstract();

            List.prototype.set = function (index, value) {
                if (typeof index === 'undefined') {
                    return this;
                }

                if (typeof value !== 'undefined') {
                    // called with key and value, e.g. .set('foo', 'bar');
                    if (index >= 0) {
                        var newSub = this.setSubValue(value, index);
                        if (newSub) {
                            var newData = [].concat(this.data);
                            newData[index] = newSub;
                            return new List(newData);
                        }
                    }

                    return this; // non-numeric index
                }

                // called with single argument
                value = index;

                if (alchemy.isArray(value)) {
                    var newList = alchemy.each(value, this.setSubValue, this);
                    if (newList && newList.length > 0) {
                        return new List(newList);
                    }
                    return this;
                }

                if (alchemy.isObject(value) && value.constructor === Object) {
                    return new Struct(value);
                }

                return new Value(value);
            };


            return {
                /** @lends alchemy.core.Immutatio.prototype */

                makeImmutable: function (data) {
                    return createSub(data);
                },

                find: function (immutable, selector) {
                    if (!immutable) {
                        return null;
                    }

                    if (typeof selector === 'string') {
                        var dotIndex = selector.indexOf('.');
                        if (dotIndex >= 0) {
                            var subKey = selector.substring(0, dotIndex);
                            var remaining = selector.substring(dotIndex + 1, selector.lenght);
                            return this.find(immutable.sub(subKey), remaining);
                        }
                        return immutable.sub(selector);
                    }

                    return immutable;
                }
            };
        }
    });
}());
