(function () {
    'use strict';

    var alchemy = require('./Alchemy.js');

    /**
     * A potion to store and manage a set of data objects. The may be
     * instances of {@link alchemy.core.Modelum} but it's not neccessary.
     * It is recommended, that the items to store provide a property which
     * can act as a key (e.g. "id"; see {@link alchemy.core.Collectum.idProp})
     *
     * @class
     * @name alchemy.core.Collectum
     * @extends alchemy.core.Oculus
     */
    alchemy.formula.add({
        name: 'alchemy.core.Collectum',
        alias: 'Collectum',
        ingredients: [{
            key: 'observable',
            ptype: 'alchemy.core.Observari',
        }, {
            key: 'observer',
            ptype: 'alchemy.core.Oculus',
        }],
        extend: 'alchemy.core.MateriaPrima',
        requires: ['alchemy.core.Modelum'],
        overrides: {
            /** @lends alchemy.core.Collectum */

            /**
             * Fired after every change of the stored data
             *
             * @event
             * @name alchemy.core.Collectum#change
             * @param {Object} data The event data providing:
             *      - <code>insertIndex {Number}</code>: the index where the new items where inserted
             *      - <code>added {Array}</code>: the list of new items
             *      - <code>removed {Object}</code>: the removed item
             */

            /**
             * Fired after adding an item
             *
             * @event
             * @name alchemy.core.Collectum#add
             * @param {Object} data The event data providing the property <code>added</code>
             *      which contains the added itmes
             */

            /**
             * Fired after removeing an item
             *
             * @event
             * @name alchemy.core.Collectum#remove
             * @param {Object} data The event data providing the property <code>removed</code>
             *      which contains the removed item
             */

            /**
             * The property which is used to determine the item's id
             * Defaults to <code>id</code>
             *
             * @property idProp
             * @type String
             */
            idProp: 'id',

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
                var key = alchemy.isObject(data) ? data[this.idProp] : data;
                return this.keys[key] >= 0;
            },

            /**
             * Adds new data at the end of the collection
             *
             * @param {Object/Array} data
             *      The new data object or an array of objects;
             *      It is recommended that the objects provide the property "id" which will act
             *      as the key. If there is no id the object will get one.
             *
             * @param {Boolean} silent
             *      Optional. Set to <code>true</true> to prevent events
             */
            add: function (data, silent) {
                this.insert(this.items.length, data, silent);
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
             *
             * @param {Boolean} silent
             *      Optional. Set to <code>true</true> to prevent events
             */
            insert: function (index, data, silent) {
                var i, l;          // loop params
                var id;            // an item id - acting as key
                var args;          // the arguments for inserting the data to the item set
                var filtered = []; // the actually new data
                var item;          // a single data item

                // normalize data argument
                if (!alchemy.isArray(data)) {
                    data = [data];
                }
                // filter items which are already stored
                for (i = 0, l = data.length; i < l; i++) {
                    item = data[i];
                    if (!this.contains(item) && filtered.indexOf(item) < 0) {
                        filtered.push(item);
                        this.startObservingItem(item);
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
                    id = this.items[i][this.idProp];
                    if (!id) {
                        id = alchemy.id();
                        this.items[i][this.idProp] = id;
                    }
                    this.keys[id] = i;
                }
                // repair length attribute
                this.length = this.items.length;

                if (silent !== true) {
                    this.trigger('add', {
                        added: filtered,
                        insertIndex: index
                    });

                    this.trigger('change', {
                        added: filtered,
                        insertIndex: index
                    });
                }
            },

            /**
             * Returns a stored item by its index; If the given index is lesser then zero
             * the collection is traversed backwards;
             *
             * @param {Number} index
             *      The index of the stored object, zero based
             *
             * @return Object
             *      The stored object (<code>undefined</code> if there is no such object)
             *
             * @example
             * collection.at(0); // return the first item
             * collection.at(1); // return the second
             * collection.at(-1); // return the last items
             * collection.at(-2); // return the last but one item
             *
             */
            at: function (index) {
                if (index < 0) {
                    return this.at(index + this.length);
                } else {
                    return this.items[index];
                }
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
                    key = data[this.idProp];
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
             *
             * @param {Boolean} silent
             *      Optional. Set to <code>true</true> to prevent events
             */
            remove: function (data, silent) {
                this.removeAt(this.indexOf(data), silent);
            },

            /**
             * Removes the item at the given position from the collection
             *
             * @param {Number} index
             *      The index of the item to be removed
             *
             * @param {Boolean} silent
             *      Optional. Set to <code>true</true> to prevent events
             */
            removeAt: function (index, silent) {
                var removedItem;
                if (!alchemy.isNumber(index) || index < 0 || index >= this.items.length) {
                    // index is not within the items array dimensions
                    return;
                }
                removedItem = this.items[index];
                this.stopObservingItem(removedItem);

                // remove item from key hash and list
                delete this.keys[removedItem[this.idProp]];
                this.items.splice(index, 1);
                // repair index hash
                for (var i = index, l = this.items.length; i < l; i++) {
                    var id = this.items[i][this.idProp];
                    this.keys[id] = i;
                }
                // repair length attribute
                this.length = this.items.length;

                if (silent !== true) {
                    this.trigger('remove', {
                        removed: removedItem
                    });

                    this.trigger('change', {
                        removed: removedItem
                    });
                }
            },

            /**
             * Iterates through all items and calls the given callback for each one
             *
             * @param {Function} callback
             *      The callback which is executed for eachh item
             *      It is called with the following arguments:
             *      <ul>
             *          <li>The current item</li>
             *          <li>The index of current item</li>
             *          <li>The arguments passed to the <code>Collectum.each</code></li>
             *      </ul>
             *
             * @param {Object} scope
             *      Optional. The execution scope for the callback function
             *
             * @param {Array} args
             *      Optional. A set of additional arguments which will be passed to the callback
             */
            each: function (callback, scope, args) {
                alchemy.each(this.items, callback, scope, args);
            },

            /**
             * Starts observing a stored item to proxy the item events
             * @private
             */
            startObservingItem: function (item) {
                this.observe(item, '*', this.itemEventHandler, this);
            },

            /**
             * Stops the observing (e.g. after removing this item)
             * @private
             */
            stopObservingItem: function (item) {
                if (this.isObservable(item)) {
                    item.off(null, null, this);
                }
            },

            /**
             * The handler method for all item events
             * @private
             */
            itemEventHandler: function (data, event) {
                data = data || {};
                data.source = event.source;
                this.trigger(event.name, data);
            }
        }
    });
}());
