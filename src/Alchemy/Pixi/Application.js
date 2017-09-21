'use strict';

var pixi = require('pixi.js');

exports.init = function (options) {
    return function (node) {
        return function () {
            var app = new pixi.Application(options);
            node.appendChild(app.view);
            return app;
        };
    };
};

exports.stage = function (app) {
    return app.stage;
};

exports.body = function () {
    return document.body;
};

exports.tickP = function (make) {
    return function (app) {
        return function () {
            var sig = make(1);
            app.ticker.add(function (delta) {
                sig.set(delta);
            });
            return sig;
        };
    };
};

exports.loop = function (app) {
    return function (sig) {
        return function () {
            app.ticker.add(function (delta) {
                sig.set(delta);
            });
            return {};
        };
    };
};
