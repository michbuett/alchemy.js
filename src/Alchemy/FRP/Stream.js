'use strict';

exports.fromVal = function (val) {
    return function () {
        return val;
    };
};

exports.fromChannel = function (channel) {
    return function (initialVal) {
        var val = initialVal;

        channel.subscribe(function (newVal) {
            val = newVal;
        });

        return function () {
            return val;
        };
    };
};

exports.mapImpl = function (fn) {
    return function (s) {
        return function () {
            return fn(s());
        };
    };
};

exports.applyImpl = function (sf) {
    return function (sa) {
        return function () {
            return sf()(sa())
        };
    };
};

exports.sample = function (event) {
    return function (stream) {
        return function () {
            event.subscribe(function () {
                stream()();
            });
        };
    };
};

exports.sampleBy = function (event) {
    return function (stream) {
        return function () {
            event.subscribe(function (a) {
                stream()(a)();
            });
        };
    };
};

exports.combine = function (fn) {
    return function (s1) {
        return function (s2) {
            return function () {
                return fn(s1())(s2());
            };
        };
    };
};
