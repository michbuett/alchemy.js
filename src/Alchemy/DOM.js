'use strict';

exports.fromEventP = function fromEventP() {
};

exports.keyPressedP = function keyPressedP(constant) {
    return function () {
        var out = constant([]);
        var pressedKeys = [];
        var isModifierKey = function (keyCode) {
            return keyCode === 16 || // shift
                keyCode === 17 || // ctrl
                keyCode === 18 || // alt
                keyCode === 91; // meta
        };
        var updateModifyerKeys = function (currentList, e) {
            return currentList.map(function (stored) {
                return {
                    keyCode: stored.keyCode,
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey,
                    altKey: e.altKey,
                    metaKey: e.metaKey,
                };
            });
        };

        window.addEventListener('keydown', function(e) {
            // console.log('[KEYDOWN]', e);
            var keyCode = e.keyCode;
            if (pressedKeys[keyCode]) {
                // already pressed -> no new information
                return;
            }

            pressedKeys[keyCode] = true;

            if (isModifierKey(keyCode)) {
                out.set(updateModifyerKeys(out.get(), e));
            } else {
                out.set(out.get().concat([{
                    keyCode: keyCode,
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey,
                    altKey: e.altKey,
                    metaKey: e.metaKey,
                }]));
            }
        });

        window.addEventListener('keyup', function(e) {
            // console.log('[KEYUP]', e);
            var keyCode = e.keyCode;
            pressedKeys[keyCode] = false;

            if (isModifierKey(keyCode)) {
                out.set(updateModifyerKeys(out.get(), e));

            } else {
                var currentPressed  = out.get();
                var newList = [];

                for (var i = 0, l = currentPressed.length; i < l; i++) {
                    if (e.keyCode !== currentPressed[i].keyCode) {
                        newList.push(currentPressed[i]);
                    }
                }

                out.set(newList);
            }
        });

        return out;
    };
};
