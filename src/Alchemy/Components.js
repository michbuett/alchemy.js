'use strict';

exports.init = function (key) {
    return function (val) {
        var result = {};
        result[key] = val;
        return result;
    };
};

exports.insert = function (key) {
    return function (val) {
        return function (source) {
            var result = Object.assign({}, source);
            result[key] = val;
            return result;
        };
    };
};

exports.mapP = function (fn) {
    return function (cmps) {
        var keys = Object.keys(cmps);
        var result = {};

        for (var i = 0, l = keys.length; i < l; i++) {
            var k = keys[i];
            result[k] = fn(cmps[k]);
        }

        return result;
    };
};

exports.unwrap = function (cmps) {
    return function () {
        var keys = Object.keys(cmps);
        var result = {};

        for (var i = 0, l = keys.length; i < l; i++) {
            var k = keys[i];
            result[k] = cmps[k]();
        }

        return result;
    };
};
