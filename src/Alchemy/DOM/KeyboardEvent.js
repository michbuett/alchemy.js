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
