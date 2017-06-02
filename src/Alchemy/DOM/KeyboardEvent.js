'use strict';

exports.key = function key(k) {
    return k;
};

exports.keyCode = function keyCode(keyCode) {
    return keyCode;
};

exports.keyPressedP = function keyPressedP(constant) {
    return function () {
        var filterFn = function (key) {
            return typeof key !== 'undefined';
        };

        var out = constant({
            pressed: [],
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: false,
        });

        var pressedKeys = [];

        window.addEventListener('keydown', function(e) {
            // console.log('[KEYDOWN]', e);
            var keyCode = e.keyCode;
            if (pressedKeys[keyCode]) {
                // already pressed -> no new information
                return;
            }

            pressedKeys[keyCode] = e.code;
            out.set({
                pressed: pressedKeys.filter(filterFn),
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                metaKey: e.metaKey,
            });

            // console.log('KEYDOWN', pressedKeys.filter(filterFn));
        });

        window.addEventListener('keyup', function(e) {
            // console.log('[KEYUP]', e);
            pressedKeys[e.keyCode] = undefined;
            out.set({
                pressed: pressedKeys.filter(filterFn),
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey,
                altKey: e.altKey,
                metaKey: e.metaKey,
            });

            // console.log('KEYUP', pressedKeys.filter(filterFn));
        });

        return out;
    };
};
