'use strict';

exports.keypressedP = function (constant) {
    var filterFn = function (key) {
        return typeof key !== 'undefined';
    };

    return function (keymap) {
        var out = constant([]);
        var pressed = [];

        return function () {
            window.addEventListener('keydown', function(e) {
                if (pressed[e.keyCode]) {
                    return;
                }

                pressed[e.keyCode] = e;
                out.set(keymap(pressed.filter(filterFn)));
            });

            window.addEventListener('keyup', function(e) {
                if (pressed[e.keyCode]) {
                    pressed[e.keyCode] = undefined;
                    out.set(keymap(pressed.filter(filterFn)));
                }
            });

            return out;
        };
    };
};
