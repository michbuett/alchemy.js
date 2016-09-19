/* global Map: true */
(function (global) {
    'use strict';

    if (typeof global.Map === 'function') {
        return;
    }

    global.Map = function (data) {
        this.size = 0;

        if (Array.isArray(data)) {
            for (var i = 0, l = data.length; i < l; i++) {
                this.set(data[i][0], data[i][1]);
            }
        }
    };

    global.Map.prototype.set = function (key, value) {
        var isNew = typeof this['__' + key] === 'undefined';

        if (isNew) {
            this[this.size] = key;
            this.size++;
        }

        this['__' + key] = value;

        return this;
    };

    global.Map.prototype.get = function (key) {
        return this['__' + key];
    };

    global.Map.prototype.forEach = function (cb, ctx) {
        for (var i = 0; i < this.size; i++) {
            var key = this[i];
            var value = this.get(key);

            cb.call(ctx, value, key, this);
        }
    };

    return Map;
}(typeof window !== 'undefined' ? window : process));
