'use strict';

var pixi = require('pixi.js');

function createUpdates(graphic, attributes) {
    return attributes.map(function (partialUpdate) {
        return partialUpdate(graphic);
    });
}

function initSprite(s, props) {
    s.x = props.xpos;
    s.y = props.ypos;
    s.alpha = props.alpha;
    return s;
}

function createShape(drawFn) {
    return function (props) {
        return function (attr) {
            return function (parentResource) {
                return function () {
                    var resource = drawFn(props);
                    var updates = createUpdates(resource, attr);
                    var updateFn = function updateShape() {
                        for (var i = 0, l = updates.length; i < l; i++) {
                            updates[i]();
                        }
                    };
                    var removeFn = function removeShape() {
                        parentResource.removeChild(resource);
                    };

                    parentResource.addChild(resource);

                    return {
                        update: updateFn,
                        remove: removeFn
                    };
                };
            };
        };
    };
}

exports.circle = createShape(function drawCircle(props) {
    var g = new pixi.Graphics();
    g.beginFill(props.fillColor);
    g.drawCircle(0, 0, props.radius);
    g.endFill();

    return initSprite(new pixi.Sprite(g.generateCanvasTexture()), props);
});

exports.rect = createShape(function drawCircle(props) {
    var g = new pixi.Graphics();
    g.beginFill(props.fillColor);
    g.drawRect(0, 0, props.width, props.height);
    g.endFill();

    return initSprite(new pixi.Sprite(g.generateCanvasTexture()), props);
});
