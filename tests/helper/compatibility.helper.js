(function () {
    'use strict';
    jasmine.createSpyOrg = jasmine.createSpy;
    jasmine.createSpy = function () {
        var spy = jasmine.createSpyOrg();

        addFunctions(spy, {
            andCallFake: function (fn) {
                return spy.and.callFake(fn);
            },

            andCallThrough: function () {
                return spy.and.callThrough();
            },

            andReturn: function (value) {
                return spy.and.returnValue(value);
            },

            reset: function () {
                return spy.calls.reset();
            },

            getCalls: function () {
                if (typeof spy.calls.all === 'function') {
                    return spy.calls.all();
                }
                return spy.calls;
            },
        });

        if (spy.calls && typeof spy.calls.count === 'function') {
            Object.defineProperty(spy, 'callCount', {
                get: function () {
                    return spy.calls.count();
                }
            });
        }

        if (spy.calls && typeof spy.calls.mostRecent === 'function') {
            Object.defineProperty(spy, 'mostRecentCall', {
                get: function () {
                    return spy.calls.mostRecent();
                }
            });
        }
        return spy;
    };

    function addFunctions(obj, ext) {
        Object.keys(ext).forEach(function (key) {
            if (typeof obj[key] === 'function') {
                return;
            }
            obj[key] = ext[key];
        });
    }
}());
