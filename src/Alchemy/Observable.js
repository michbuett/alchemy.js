var Observable = function (initialValue) {
    this._v = initialValue;
    this._s = [];
};

Observable.prototype.val = function () {
    return this._v;
};

Observable.prototype.set = function (newValue) {
    this._v = newValue;
    for (var i = 0, l = this._s.length; i < l; i++) {
        this._s[i](newValue);
    }
    return newValue;
};

Observable.prototype.subscribe = function (subscription) {
    this._s.push(subscription);
    subscription(this._v);
};

exports.initialize = function (val) {
    return new Observable(val);
};

exports.run = function (fn) {
    return function(obs) {
        return function() {
            obs.subscribe(function(val) {
                fn(val)();
            });
            return {};
        };
    };
};

exports.mutate = function (fn) {
    return function (sig) {
        return function (obs) {
            sig.subscribe(function(val) {
                obs.set(fn(val)(obs.val()));
            });
            return obs;
        };
    };
};
