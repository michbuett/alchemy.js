(function () {
    'use strict';

    var alchemy = require('../core/Alchemy.js');

    /**
     * Description
     *
     * @class
     * @name alchemy.benchmarking.TestRunner
     * @extends alchemy.core.Observari
     */
    alchemy.formula.add({
        name: 'alchemy.benchmarking.TestRunner',
        extend: 'alchemy.core.Observari',
        requires: [
            'alchemy.core.Collectum',
            'alchemy.benchmarking.TestSuite',
        ],
        overrides: {
            /** @lends alchemy.benchmarking.TestRunner.prototype */

            timer: undefined,
            samples: 50,
            iterations: 100,
            tests: undefined,

            init: function () {
                this.suites = alchemy('alchemy.core.Collectum').brew();
            },

            add: function (cfg) {
                if (alchemy.isArray(cfg)) {
                    alchemy.each(cfg, this.add, this);
                } else {
                    var suite = alchemy('alchemy.benchmarking.TestSuite').brew(alchemy.mix({
                        timer: this.timer,
                        samples: this.samples,
                        iterations: this.iterations
                    }, cfg));

                    suite.on('test:start', function (data) {
                        this.trigger('test:start', data);
                    }, this);
                    suite.on('test:completed', function (data) {
                        this.trigger('test:completed', data);
                    }, this);

                    this.suites.add(suite);
                }
                return this;
            },

            run: function () {
                this.trigger('start');
                this.runNext(this.suites.toData());
            },

            runNext: function (suites) {
                var suite = suites.shift();
                if (suite) {
                    suite.once('completed', function () {
                        this.trigger('suite:completed', {
                            suite: suite
                        });
                        this.runNext(suites);
                    }, this);

                    this.trigger('suite:start', {
                        suite: suite
                    });

                    suite.run();
                } else {
                    this.trigger('completed');
                }
            },
        }
    });
}());
