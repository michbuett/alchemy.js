/* global Map: true */
(function (global) {
    'use strict';

    if (typeof global.Map === 'function') {
        return;
    }

    global.Map = function () {
        this.size = 0;
    };

    global.Map.prototype.set = function (key, value) {
        this[this.size] = key;
        this['__' + key] = value;
        this.size++;
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
