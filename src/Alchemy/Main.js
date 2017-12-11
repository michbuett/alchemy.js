/* global console */
'use strict';

exports.logAny = function (any) {
    return function () {
        console.log(JSON.stringify(any, null, ' '));
    };
};
