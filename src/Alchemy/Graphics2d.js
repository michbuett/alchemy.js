'use strict';

var pixi = require('pixi.js');

function appendView(selector, view) {
    var node = document.querySelector(selector);

    if (node) {
        node.appendChild(view);
    } else {
        window.requestAnimationFrame(function () {
            appendView(view);
        });
    }
}

exports.render = function (options) {
    return function (selector) {
        return function (graphic) {
            return function () { // Effect (Stream (Effect Unit))
                if (window.devicePixelRatio >= 0) {
                    options.resolution = window.devicePixelRatio;
                }

                var app = new pixi.Application(options);
                app.view.style.width = options.width + 'px';
                app.view.style.height = options.height + 'px';
                appendView(selector, app.view);

                var update = graphic(app.stage)().update;

                return function () { // Stream (Effect Unit)
                    return update // Effect Unit
                };
            };
        };
    };
};
