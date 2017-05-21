/* jshint browser: true */
/* globals exports */

const reqAnimFrame = window.requestAnimationFrame;

exports.loop = function (fn) {
    const loopFn = function (now) {
        reqAnimFrame(loopFn);
        fn(now);
    };

    return function () {
        reqAnimFrame(loopFn);
    };
};

exports.drainBuffer = function (fn) {
    return function (buf) {
        return function () {
            var i, l, values = buf.consumeValues(fn);
            for (i = 0, l = values.length; i < l; i++) {
                values[i]();
            }
            return {};
        };
    };
};
