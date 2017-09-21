'use strict';

var pixi = require('pixi.js');

exports.stage = function () {
    return new pixi.Container();
};

exports.render = function (renderer) {
    return function (stage) {
        return function () {
            renderer.render(stage);
            return {};
        };
    };
};
