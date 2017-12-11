'use strict';

var pixi = require('pixi.js');

exports.init = function (options) {
    return function (selector) {

        function appendView(view) {
            var node = document.querySelector(selector);

            if (node) {
                node.appendChild(view);
            } else {
                window.requestAnimationFrame(function () {
                    appendView(view);
                });
            }
        }

        return function () {
            if (window.devicePixelRatio >= 0) {
                options.resolution = window.devicePixelRatio;
            }

            var app = new pixi.Application(options);
            app.view.style.width = options.width + 'px';
            app.view.style.height = options.height + 'px';

            appendView(app.view);

            return app;
        };
    };
};

exports.stage = function (app) {
    return app.stage;
};

exports.tickP = function (createChannel) {
    return function (app) {
        return function () {
            var channel = createChannel();
            app.ticker.add(function (delta) {
                channel.send(delta);
            });
            return channel;
        };
    };
};
