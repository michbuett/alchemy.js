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
        requires: ['alchemy.core.Modelum'],
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

            /**
             * Initialze collection
             * IMPORTENT: call super when overriding
             * @protected
             */
            init: function () {
                var initialItems = this.items;

                this.items = [];
                this.keys = {};

                if (alchemy.isArray(initialItems)) {
                    this.add(initialItems);
                }
            },

            /**
             * Checks if the collection contains the given item
             *
             * @param {String/Object} data
             *      The data object or its id
             *
             * @return Boolean
             *      <code>true</code> if and only if there is an item with the same
             *      id stored in the collection
             */
            contains: function (data) {
                var key = alchemy.isObject(data) ? data.id : data;
                return this.keys[key] >= 0;
            },

            /**
             * Adds new data at the end of the collection
             *
             * @param {Object/Array} data
             *      The new data object or an array of objects;
             *      It is recommended that the objects provide the property "id" which will act
             *      as the key. If there is no id the object will get one.
             */
            add: function (data) {
                this.insert(this.items.length, data);
            },

            /**
             * Inserts new data at the given position
             *
             * @param {Number} index
             *      The insertion index
             *
             * @param {Object/Array} data
             *      The new data object or an array of objects;
             *      It is recommended that the objects provide the property "id" which will act
             *      as the key. If there is no id the object will get one.
             */
            insert: function (index, data) {
                var i, l;          // loop params
                var id;            // an item id - acting as key
                var args;          // the arguments for inserting the data to the item set
                var filtered = []; // the actually new data

                // normalize data argument
                if (!alchemy.isArray(data)) {
                    data = [data];
                }
                // filter items which are already stored
                for (i = 0, l = data.length; i < l; i++) {
                    if (!this.contains(data[i]) && filtered.indexOf(data[i]) < 0) {
                        filtered.push(data[i]);
                    }
                }
                if (filtered.length === 0) {
                    // no new data
                    return;
                }
                // bound index to the items array dimensions
                index = Math.max(0, Math.min(this.items.length, index));
                // add item to the others
                args = [index, 0].concat(filtered);
                this.items.splice.apply(this.items, args);
                // repair index hash
                for (i = index, l = this.items.length; i < l; i++) {
                    id = this.items[i].id;
                    if (!id) {
                        id = alchemy.id();
                        this.items[i].id = id;
                    }
                    this.keys[id] = i;
                }
                // repair length attribute
                this.length = this.items.length;
            },

            /**
             * Returns a stored item by its index
             *
             * @param {Number} index
             *      The index of the stored object
             *
             * @return Object
             *      The stored object (<code>undefined</code> if there is no such object)
             */
            at: function (index) {
                return this.items[index];
            },

            /**
             * Returns a stored item by its id
             *
             * @param {String} id
             *      The id of the stored object
             *
             * @return Object
             *      The stored object (<code>undefined</code> if there is no such object)
             */
            get: function (id) {
                return this.at(this.keys[id]);
            },

            /**
             * Returns the index of a stored object
             *
             * @param {String/Object} data
             *      The data object or it's id
             *
             * @return Number
             *      The index (zero based) with the data store;
             *      <code>-1</code> if there is no such item
             */
            indexOf: function (data) {
                var key = data;
                if (alchemy.isObject(data)) {
                    key = data.id;
                }
                return alchemy.isNumber(this.keys[key]) ? this.keys[key] : -1;
            },

            /**
             * Returns the data of all stored objects
             * If you have stored complex objects (with function, ...) it is recommended
             * that these objects provide a <code>toData</code> method the get the pure
             * data (e.g. as {@link alchemy.core.Modelum}
             *
             * @return Array
             *      The set of data
             */
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
            },

            /**
             * Removes an item from the collection
             *
             * @param {String/Object} data
             *      The data to be removed or its id
             */
            remove: function (data) {
                this.removeAt(this.indexOf(data));
            },

            /**
             * Removes the item at the given position from the collection
             *
             * @param {Number} index
             *      The index of the item to be removed
             */
            removeAt: function (index) {
                if (index < 0 || index >= this.items.length) {
                    // index is not within the items array dimensions
                    return;
                }
                // remove item from key hash and list
                delete this.keys[this.items[index].id];
                this.items.splice(index, 1);
                // repair index hash
                for (var i = index, l = this.items.length; i < l; i++) {
                    var id = this.items[i].id;
                    this.keys[id] = i;
                }
                // repair length attribute
                this.length = this.items.length;

            }
        }
    });
}());
