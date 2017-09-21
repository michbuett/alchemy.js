'use strict';

var pixi = require('pixi.js');
var graphics = [];

exports.rect = function (stage) {
    return function (fillColor) {
        return function (width) {
            return function (height) {
                return function () {
                    var id = graphics.length;
                    var g = new pixi.Graphics();

                    g.beginFill(fillColor);
                    g.drawRect(0, 0, width, height);
                    g.endFill();

                    var rect = new pixi.Sprite(g.generateCanvasTexture());

                    stage.addChild(rect);
                    graphics[id] = rect;

                    return id;
                };
            };
        };
    };
};

exports.updatePos = function (o) {
    return function () {
        var g = graphics[o.pixiRef];
        g.x = o.x;
        g.y = o.y;
    };
};

exports.assign = function (target) {
    return function (source) {
        return Object.assign(target, source);
    };
};
