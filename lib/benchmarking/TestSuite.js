(function () {
    'use strict';

    var alchemy = require('../core/Alchemy.js');

    /**
     * Description
     *
     * @class
     * @name benchmarking.TestSuite
     * @extends alchemy.core.Observari
     */
    alchemy.formula.add({
        name: 'alchemy.benchmarking.TestSuite',
        extend: 'alchemy.core.Observari',
        overrides: {
            /** @lends benchmarking.TestSuite.prototype */

            timer: undefined,
            samples: 100,
            iterations: 1000,
            tests: undefined,

            init: function () {
                if (!alchemy.isArray(this.tests)) {
                    this.tests = [];
                }
            },

            add: function (testCfg) {
                if (alchemy.isArray(testCfg)) {
                    this.tests = this.tests.concat(testCfg);
                } else if (alchemy.isObject(testCfg)) {
                    this.tests.push(testCfg);
                }
                return this;
            },

            run: function () {
                this.trigger('start');
                this.currentIndex = 0;
                this.runNext();
            },

            runNext: function () {
                var nextTest = this.tests[this.currentIndex++];
                if (nextTest) {
                    var me = this;
                    setTimeout(function () {
                        me.runTest(nextTest, function () {
                            this.runNext();
                        });
                    }, 1);
                } else {
                    this.trigger('completed');
                }
            },

            runTest: function (cfg, cb) {
                var count;
                var times = [];
                var now, delta;
                var testSetup, testArgs, testScope, testFn = cfg.test;

                this.trigger('test:start', {
                    test: cfg
                });

                for (var i = 0; i < this.samples; i++) {
                    if (typeof cfg.setup === 'function') {
                        testSetup = cfg.setup();
                        testArgs = testSetup.args || [];
                        testScope = testSetup.scope || {};
                    } else {
                        testArgs = [];
                        testScope = {};
                    }

                    count = this.iterations;
                    now = this.timer.now();
                    while (--count) {
                        testFn.apply(testScope, testArgs);
                    }
                    delta = this.timer.now() - now;
                    times.push(1000 * delta / this.iterations);
                }

                var durr = times.reduce(function (sum, delta) {
                    return sum + delta;
                }) / times.length;

                this.trigger('test:completed', {
                    durration: durr,
                    hz: 1000 / durr,
                    test: cfg
                });

                cb.call(this);
            }
        }
    });
}());
