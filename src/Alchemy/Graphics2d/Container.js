'use strict';

exports.arrayImpl = function (map) {
    return function (createGraphic) {
        return function (arrayS) {
            return function (resource) { // Graphic (Resource → Effect (...))
                return function () { // Effect { update, remove }
                    var children = [];

                    function createStreamFromIndex(i) {
                        return map(function (arr) {
                            return arr[i];
                        })(arrayS);
                    }

                    function updateArray() {
                        var newLength = arrayS().length;
                        while (children.length < newLength) {
                            var s = createStreamFromIndex(children.length);
                            var g = createGraphic(s)
                            children.push(g(resource)());
                        }

                        while (children.length > newLength) {
                            children.pop().remove();
                        }

                        for (var i = 0; i < newLength; i++) {
                            children[i].update();
                        }
                    }

                    function removeArray() {
                        while (children.length > 0) {
                            children.pop().remove();
                        }
                    };

                    return {
                        update: updateArray,
                        remove: removeArray
                    };
                };
            };
        };
    };
};

exports.box = function (graphics) {
    return function (resource) {
        return function () {
            var children = graphics.map(function (g) {
                return g(resource)();
            });

            function updateBox () {
                for (var i = 0, l = children.length; i < l; i++) {
                    children[i].update();
                }
            }

            function removeBox() {
                while (children.length > 0) {
                    children.pop().remove();
                }
            };

            return {
                update: updateBox,
                remove: removeBox
            };
        };
    };
};

exports.zlayer = function () {
    // TODO implement me
};
