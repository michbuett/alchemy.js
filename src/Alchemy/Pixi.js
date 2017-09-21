'use strict';

exports.pixi = function () {
    return function () {
        return require('pixi.js');
    };
};

exports.body = function () {
    return function () {
        return document.body;
    };
};
