'use strict';

exports.bufferSignal = function (sig) {
    var values = [];
    var subscription = function (val) {
        values.push(val);
    };

    sig.subscribe(subscription);

    return {
        drain: function () {
            var result = values;
            values = [];
            return result;
        },

        consumeValues: function (fn) {
            var i, l, results = [];
            for (i = 0, l = values.length; i < l; i++) {
                results.push(fn(values[i]));
            }
            values = [];
            return results;
        },
    };
};

exports.drain = function (buf) {
    return buf.drain();
};

exports.runBatch = function (dataSignal) {
    return function (processingFunctions) {
        return function (triggerSignal) {
            var bufferedValues = [];
            var runBatch = function runBatch() {
                for (var i1 = 0, l1 = processingFunctions.length; i1 < l1; i1++) {
                    var fn = processingFunctions[i1];
                    for (var i2 = 0, l2 = bufferedValues.length; i2 < l2; i2++) {
                        fn(bufferedValues[i2])();
                    }
                }
                bufferedValues = [];
            };

            dataSignal.subscribe(function (val) {
                bufferedValues.push(val);
            });

            return function () {
                triggerSignal.subscribe(runBatch);
            };
        };
    };
};

var muff = function (sink) {
    return function (id) {
        return function (sig) {
            return function () {
                sig.subscribe(function (val) {
                    setVal(sink, id, val);
                });
                return sink;
            };
        };
    };
};

var setVal = function (sink, key, val) {
    var idx;

    sink.___keys___ = sink.___keys___ || {};
    idx = sink.___keys___[key];

    if (typeof idx !== 'number') {
        idx = sink.length;
        sink.___keys___[key] = idx;
    }

    sink[idx] = val;
};

exports.sink = muff([]);

exports.muff = muff;

exports.foreach = function (sink) {
    return function (fn) {
        return function () {
            fn(sink)();
            return {};
        };
    };
};
