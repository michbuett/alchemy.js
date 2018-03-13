'use strict';

function Stream(readValFn) {
    this.val = readValFn;
}

exports.fromVal = function (val) {
    return new Stream(function () {
        return val;
    });
};

exports.fromEff = function (eff) {
    return new Stream(function () {
        return eff();
    });
};

exports.fromChannel = function (channel) {
    return function (initialVal) {
        var val = initialVal;

        channel.subscribe(function (newVal) {
            val = newVal;
        });

        return new Stream(function () {
            return val;
        });
    };
};

exports.mapImpl = function (fn) {
    return function (s) {
        return new Stream(function () {
            return fn(s.val());
        });
    };
};

exports.applyImpl = function (sf) {
    return function (sa) {
        return new Stream(function () {
            return sf.val()(sa.val);
        });
    };
};

exports.sample = function (event) {
    return function (stream) {
        return function () {
            event.subscribe(function () {
                stream.val()();
            });
        };
    };
};

exports.sampleBy = function (event) {
    return function (stream) {
        return function () {
            event.subscribe(function (a) {
                stream.val()(a)();
            });
        };
    };
};

exports.combine = function (fn) {
    return function (s1) {
        return function (s2) {
            return new Stream(function () {
                return fn(s1.val())(s2.val());
            });
        };
    };
};

exports.inspect = function (s) {
    return function () {
        return s.val();
    };
};
