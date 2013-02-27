(function () {
    'use strict';

    var alchemy = require('./Alchemy.js');

    /**
     * @class alchemy.core.Collectum
     * @extends alchemy.core.Oculus
     */
    alchemy.formula.add({
        name: 'alchemy.core.Collectum',
        alias: 'Collectum',
        extend: 'alchemy.core.Oculus',
        requires: ['alchemy.core.Model'],
        overrides: {

            /**
             * The number of items in the collection
             *
             * @property length
             * @type Number
             */
            length: 0,

            /**
             * The set of items in the collection
             *
             * @property items
             * @type Array
             * @protected
             */
            items: undefined,

            /**
             * A map key/id -> index for fast accesses by id
             *
             * @property keys
             * @type Object
             * @protected
             */
            keys: undefined,

            init: function () {
                var initialItems = this.items;

                this.items = [];
                this.keys = {};

                if (alchemy.isArray(initialItems)) {
                    this.add(initialItems);
                }
            },

            contains: function (data) {
                var key = alchemy.isObject(data) ? data.id : data;
                return this.keys[key] >= 0;
            },

            add: function (data) {
                this.insert(this.items.length, data);
            },

            insert: function (index, data) {
                var i, l;
                var id;
                var args;

                // bound index to the items array size
                index = Math.max(0, Math.min(this.items.length, index));
                // add item to the others
                args = [index, 0].concat(data);
                this.items.splice.apply(this.items, args);
                // repair index hash
                for (i = index, l = this.items.length; i < l; i++) {
                    id = this.items[i].id;
                    this.keys[id] = i;
                }
                this.length = this.items.length;
            },

            at: function (index) {
                return this.items[index];
            },

            get: function (key) {
                return this.at(this.keys[key]);
            },

            indexOf: function (key) {
                if (alchemy.isObject(key)) {
                    key = key.id;
                }
                return alchemy.isNumber(this.keys[key]) ? this.keys[key] : -1;
            },

            toData: function () {
                var result = [];
                var item;
                var itemData;

                for (var i = 0, l = this.items.length; i < l; i++) {
                    item = this.items[i];
                    if (alchemy.isFunction(item.toData)) {
                        // the items is a model or something alike
                        // -> get pure data
                        itemData = item.toData();
                    } else {
                        // the item is properly a pure data Object
                        // -> add it itself
                        itemData = item;
                    }
                    result.push(itemData);
                }
                return result;
            }
        }
    });
}());
