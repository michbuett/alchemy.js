'use strict';

exports.pixi = function () {
    return function () {
        return require('pixi.js');
    };
};

exports.autoDetectRenderer = function (options) {
    return function (pixi) {
        return function (node) {
            return function () {
                var renderer = pixi.autoDetectRenderer(options);
                node.appendChild(renderer.view);
                return renderer;
            };
        };
    };
};

exports.body = function () {
    return function () {
        return document.body;
    };
};
