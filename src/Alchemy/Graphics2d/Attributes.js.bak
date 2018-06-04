'use strict';

var unit = {};

exports.setPos = function (stream) {
    return function (obj) {
        return function () {
            var values = stream();
            obj.x = values.x;
            obj.y = values.y;
            return unit;
        };
    };
};
