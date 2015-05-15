'use strict';

module.exports = {
    /**
     * Returns the number of milliseconds, accurate to a thousandth of a
     * millisecond, from the start of document navigation to the time the
     * now method was called.
     * @function
     *
     * @return {Number} The time in ms relative to the start of the
     *      document navigation
     */
    now: (function () {
        // The nodeJS solution process.hrtime() returns the current
        // high-resolution real time in a [seconds, nanoseconds] tuple
        // Array. It is relative to an arbitrary time in the past. It
        // is not related to the time of day and therefore not subject
        // to clock drift. The primary use is for measuring performance
        // between intervals.
        var getTime = function () {
            var hrt = process.hrtime();
            return hrt[0] * 1e6 + hrt[1] / 1000;
        };

        var loadTime = getTime();

        return function () {
            return getTime() - loadTime;
        };
    }()),
};
