'use strict';

function Stream(readValFn) {
    this.val = readValFn;
}

exports.fromVal = function (val) {
    return new Stream(function (cb) {
        cb(val);
    });
};

exports.fromEff = function (eff) {
    return new Stream(function (cb) {
        cb(eff());
    });
};
exports.fromChannel = function (channel) {
    return function (initialVal) {
        var val = initialVal;

        channel.subscribe(function (newVal) {
            val = newVal;
        });

        return new Stream(function (cb) {
            cb(val);
        });
    };
};

exports.fromCallback = function (readValFn) {
    return new Stream(readValFn);
};

exports.mapImpl = function (fn) {
    return function (s) {
        return new Stream(function (cb) {
            s.val(function (val) {
                cb(fn(val));
            });
        });
    };
};

exports.applyImpl = function (sf) {
    return function (sa) {
        return new Stream(function (cb) {
            sf.val(function (fn) {
                sa.val(function (val) {
                    cb(fn(val));
                });
            });
        });
    };
};

exports.sample = function (stream) {
    return function (event) {
        return function () {
            event.subscribe(function () {
                stream.val(function (eff) {
                    eff();
                });
            });
        };
    };
};

exports.sampleBy = function (stream) {
    return function (event) {
        return function () {
            event.subscribe(function (a) {
                stream.val(function (f) {
                    f(a)();
                });
            });
        };
    };
};

exports.combine = function (fn) {
    return function (s1) {
        return function (s2) {
            return new Stream(function (cb) {
                s1.val(function (v1) {
                    s2.val(function (v2) {
                        cb(fn(v1)(v2));
                    });
                });
            });
        };
    };
};

exports.foldrS = function (fn) {
    return function (a) {
        return function (s) {
            return new Stream(function (cb) {
                var result = a;
                s.val(function (v) {
                    result = fn(v)(result);
                });

                cb(result);
            });
        };
    };
};

exports.foldlS = function (fn) {
    return function (a) {
        return function (s) {
            return new Stream(function (cb) {
                var result = a;
                s.val(function (v) {
                    result = fn(result)(v);
                });

                cb(result);
            });
        };
    };
};

exports.collapse = function (s) {
    return new Stream(function (cb) {
        var result = [];
        s.val(function (v) {
            result.push(v);
        });
        cb(result);
    });
};

