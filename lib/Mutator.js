module.exports = (function () {
    'use strict';

    var Mutation = function Mutation(data) {
        this._data = data;
        this._deltas = [];
    };

    /**
     * @param {Array/String} path
     * @param {Array/Object} newVal
     * @return Mutation
     */
    Mutation.prototype.insert = function (path, newVal) {
        return this;
    };

    /**
     * @param {Array/String} path
     * @return Mutation
     */
    Mutation.prototype.remove = function (path) {
        return this;
    };

    /**
     * @param {Array/String} path
     * @param {Array/Object} newVal
     * @return Mutation
     */
    Mutation.prototype.extend = function (path, newVal) {
        return this;
    };

    /**
     * @param {Mutation} mutation
     * @return Mutation
     */
    Mutation.prototype.combine = function (mutation) {
        this._deltas = this._deltas.concat(mutation.deltas());
        return this;
    };

    /**
     * @param {Array/String} path
     * @param {} newVal
     * @return Mutation
     */
    Mutation.prototype.set = function (path, newVal) {
        if (typeof path === 'string') {
            path = path.split('.');
        }

        this._deltas.push({
            type: 'update',
            path: path,
            newValue: newVal,
            oldValue: findInData(path, this._data)
        });

        return this;
    };

    /**
     * @return Object/Array The new data with all deltas applied
     */
    Mutation.prototype.apply = function () {
        var result = clone(this._data);
        var clones = {};

        clones[''] = result;

        for (var i = 0, l = this._deltas.length; i < l; i++) {
            result = applyDelta(this._deltas[i], result, clones);
        }

        return result;
    };

    Mutation.prototype.deltas = function () {
        return this._deltas;
    };

    return {
        mutate: function (data) {
            return new Mutation(data);
        },
    };

    //////////////////////////////////////////////////////////////////
    // PRIVATE HELPER

    /** @private */
    function findInData(path, data) {
        var result = data;
        for (var i = 0, l = path.length; i < l; i++) {
            var key = path[i];
            if (typeof result === 'undefined') {
                throw 'Given data ' + data + ' does not contain ' + path.join('.');
            }
            result = result[key];
        }
        return result;
    }

    /** @private */
    function applyDelta(delta, result, cloneCache) {
        return setInData(delta.path, result, delta.newValue, cloneCache);
    }

    /** @private */
    function setInData(path, data, newVal, cloneCache) {
        path = [].concat(path);

        while (path.length > 0) {
            var key = path.pop();
            var pathKey = path.join('.');

            if (!cloneCache[pathKey]) {
                cloneCache[pathKey] = clone(findInData(path, data));
            }

            cloneCache[pathKey][key] = newVal;
            newVal = cloneCache[pathKey];
        }

        return cloneCache[''];
    }

    /** @private */
    function clone(data) {
        if (Array.isArray(data)) {
            return [].concat(data);
        }

        if (data && data.constructor === Object) {
            return extendObj({}, data);
        }

        throw 'Cannot clone ' + data;
    }

    /** @private */
    function extendObj(o1, o2) {
        var keys = Object.keys(o2);
        for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];
            o1[key] = o2[key];
        }
        return o1;
    }
}());
