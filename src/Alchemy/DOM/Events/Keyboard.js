'use strict';

exports.keydownFn = function keyPressedP(channel) {
    return function keyPressedP(event) {
        return function () {
            window.addEventListener(event, function(e) {
                channel.send({
                    code: e.code,
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey,
                    altKey: e.altKey,
                    metaKey: e.metaKey,
                });
            });
            return channel;
        };
    };
};

exports.pressed = function (code) {
    return function (keys) {
        return !!keys[code];
    };
};

exports.keyboard = function () {
    return pressedKeys;
}

var pressedKeys = {};

function onKeyDown(e) {
    pressedKeys[e.code] = true;
};

function onKeyUp(e) {
    pressedKeys[e.code] = false;
};

document.addEventListener('DOMContentLoaded', function () {
    document.body.addEventListener('keydown', onKeyDown);
    document.body.addEventListener('keyup', onKeyUp);
});

document.addEventListener('unload', function () {
    document.body.removeEventListener('keydown', onKeyDown);
    document.body.removeEventListener('keyup', onKeyUp);
});
