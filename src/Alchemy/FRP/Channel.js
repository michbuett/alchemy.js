'use strict';

var id = 0;

function Channel() {
    this.id = id++;
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

exports.fps = function (fps) {
    var ch = new Channel();
    var time = Date.now();

    setInterval(function () {
        var now = Date.now();
        ch.send(now - time);
        time = now;
    }, 1000 / (fps || 1));

    return ch;
};
