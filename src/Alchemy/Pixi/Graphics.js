'use strict';

var pixi = require('pixi.js');
var graphics = [];

function addToStage(stage, g) {
    var id = graphics.length;
    var rect = new pixi.Sprite(g.generateCanvasTexture());

    stage.addChild(rect);
    graphics[id] = rect;

    return id;
}

exports.rect = function (stage) {
    return function (fillColor) {
        return function (width) {
            return function (height) {
                return function () {
                    var g = new pixi.Graphics();

                    g.beginFill(fillColor);
                    g.drawRect(0, 0, width, height);
                    g.endFill();

                    return addToStage(stage, g);
                };
            };
        };
    };
};

exports.circle = function (stage) {
    return function (fillColor) {
        return function (radius) {
            return function () {
                var g = new pixi.Graphics();

                g.beginFill(fillColor);
                g.drawCircle(0, 0, radius);
                g.endFill();

                return addToStage(stage, g);
            };
        };
    };
};

exports.setPos = function (o) {
    return function () {
        var g = graphics[o.pixiRef];
        g.x = o.x;
        g.y = o.y;
    };
};
