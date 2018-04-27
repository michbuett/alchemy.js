'use strict';

function Channel() {
    this.handler = [];
}

Channel.prototype.subscribe = function (handler) {
    this.handler.push(handler);
};

Channel.prototype.send = function (val) {
    for (var i = 0, l = this.handler.length; i < l; i++) {
        this.handler[i](val);
    }
};

exports.channel = function () {
    return new Channel();
};

exports.subscribe = function (handler) {
    return function (channel) {
        return function () {
            channel.subscribe(function (val) {
                handler(val)();
            });
            return {};
        };
    };
};

exports.send = function (channel) {
    return function (val) {
        return function () {
            channel.send(val);
            return {};
        };
    };
};
