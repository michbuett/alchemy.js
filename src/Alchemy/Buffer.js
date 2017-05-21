'use strict';

// var Stream = function (initialVal) {
//     this._val = initialVal;
//     this._subs = [];
// };
//
// Stream.prototype.subscribe = function subscribe(subscription) {
//     var subscriptions = this._subs;
//
//     subscriptions.push(subscription);
//     subscription(this._val);
//
//     return function () {
//         for (var i = 0, l = subscriptions.length; i < l; i++) {
//             if (subscriptions[i] === subscription) {
//                 subscriptions.splice(i, 1);
//                 break;
//             }
//         }
//     };
// };
//
// exports.from = function (value) {
//     return new Stream(value);
// };

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
