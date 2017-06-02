'use strict';

exports.debugLog = function (o) {
    return function () {
        /* global console */
        console.log(JSON.stringify(o, ' '));
    };
};
