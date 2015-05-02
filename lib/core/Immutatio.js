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
             * Helper to determine if a given object is an immutable
             * @private
             */
            function isImmutable(obj) {
                return obj && (obj instanceof Value || obj instanceof Struct || obj instanceof List);
            }

            /**
             * Helper to create an immutable data object depending on the type of the input
             * @private
             */
            function createSub(value, computed) {
                if (alchemy.isArray(value)) {
                    return new List(value, computed);
                } else if (alchemy.isObject(value)) {
                    if (isImmutable(value)) {
                        return value;
                    } else if (value.constructor === Object) {
                        return new Struct(value, computed);
                    }
                    return new Value(value, computed);
                }
                return new Value(value, computed);
            }

            /**
             * The abstract base class for immutable values
             *
             * @class Abstract
             * @private
             */
            function Abstract(value, data, computed) {
                this.value = value;
                this.data = data && alchemy.each(data, function (item) {
                    return createSub(item);
                });
                this.computedProps = computed;
            }

            Abstract.prototype.val = function (key) {
                if (typeof key !== 'undefined') {
                    var sub = this.sub(key);
                    if (sub) {
                        return sub.val();
                    }

                    var fn = this.computedProps && this.computedProps[key];
                    if (fn) {
                        return fn.call(this, this.val());
                    }

                    return null;
                }

                if (this.value === null) {
                    this.value = alchemy.each(this.data, function (sub) {
                        return sub.val();
                    });
                }
                return this.value;
            };

            Abstract.prototype.set = alchemy.emptyFn;

            Abstract.prototype.sub = function (key) {
                return (this.data && this.data[key]) || null;
            };

            Abstract.prototype.each = function (fn, scope, more) {
                return this.set(alchemy.each(this.data, fn, scope, more));
            };

            /** @protected */
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
             * @class Value
             * @extends Abstract
             * @private
             */
            function Value(val, computed) {
                Abstract.call(this, val, null, computed);
            }
            Value.prototype = new Abstract();

            Value.prototype.set = function _setSimpleValue(val) {
                if (isImmutable(val)) {
                    return val;
                }
                if (val === this.value) {
                    return this;
                }
                return new Value(val, this.computedProps);
            };

            /**
             * An immutable key-value store
             *
             * @class Struct
             * @extends Abstract
             * @private
             */
            function Struct(data, computed) {
                Abstract.call(this, null, data, computed);
            }
            Struct.prototype = new Abstract();

            Struct.prototype.set = function _setComplexValue(key, val) {
                if (alchemy.isString(key) && typeof val !== 'undefined') {
                    // called with key and value, e.g. .set('foo', 'bar');
                    var newSub = this.setSubValue(val, key);
                    if (newSub) {
                        var newData = alchemy.mix({}, this.data);
                        newData[key] = newSub;
                        return new Struct(newData, this.computedProps);
                    }
                    return this;
                }

                if (isImmutable(key)) {
                    return key;
                }

                if (alchemy.isArray(key)) {
                    // called with array, e.g. .set([1, 2, ...]);
                    return new List(key, this.computedProps);
                }

                if (alchemy.isObject(key) && key.constructor === Object) {
                    // called with raw js object, e.g. .set({foo: 'bar'});
                    var changedSubs = alchemy.each(key, this.setSubValue, this);
                    if (changedSubs && Object.keys(changedSubs).length > 0) {
                        return new Struct(alchemy.mix({}, this.data, changedSubs), this.computedProps);
                    }
                    return this;
                }

                if (typeof key !== 'undefined') {
                    return new Value(key, this.computedProps);
                }

                return this;
            };

            /**
             * An immutable list/array
             *
             * @class List
             * @extends Abstract
             * @private
             */
            function List(data, computed) {
                Abstract.call(this, null, data, computed);
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

                if (isImmutable(value)) {
                    return value;
                }

                if (alchemy.isArray(value)) {
                    return this.updateList(value);
                }

                if (alchemy.isObject(value) && value.constructor === Object) {
                    return new Struct(value, this.computedProps);
                }

                return new Value(value, this.computedProps);
            };


            /** @private */
            List.prototype.updateList = function (newData) {
                var newList = [];
                var changed = newData.length !== this.data.length;

                for (var i = 0, l = newData.length;  i < l; i++) {
                    var newSubData = newData[i];
                    var newSub = this.setSubValue(newSubData, i);

                    if (newSub) {
                        changed = true;
                        newList.push(newSub);
                    } else {
                        newList.push(this.data[i]);
                    }
                }
                if (changed) {
                    return new List(newList, this.computedProps);
                }
                return this;
            };

            return {
                /** @lends alchemy.core.Immutatio.prototype */

                makeImmutable: function (data, computed) {
                    return createSub(data, computed);
                },

                find: function (immutable, selector) {
                    if (!immutable) {
                        return null;
                    }

                    if (typeof selector === 'string') {
                        var keys = selector.split('.');
                        for (var i = 0, l = keys.length; i < l; i++) {
                            immutable = immutable.sub(keys[i]);
                        }
                    }

                    return immutable;
                }
            };
        }
    });
}());
