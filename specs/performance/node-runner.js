(function () {
    'use strict';

    var root = __dirname + '/../../';
    var alchemy = require(root + 'lib/core/Alchemy.js');

    alchemy.heatUp({
        path: {
            alchemy: root + 'lib',
            tests: root + 'specs/performance/tests'
        },

        require: [
            'alchemy.benchmarking.TestRunner',
            'tests.PropertyAccess',
            'tests.InstanceCreation'
        ],


        onReady: function () {
            var testRunner = createTestRunner();

            testRunner.on('start', function () {
                console.log('\n+++ Run Alchemy.js Performance Tests +++');
            });

            // testRunner.once('completed', function () {
            //     console.log('\n  ... verify test results ...');
            //     testRunner = createTestRunner();
            //     testRunner.run();
            // });

            // and last but not least: start the runner
            testRunner.run();
        }
    });

    function createTestRunner() {
        var testRunner = alchemy('alchemy.benchmarking.TestRunner').brew({
            samples: 200,
            iterations: 1000,
            timer: {
                now: function () {
                    var hrtime = process.hrtime();
                    return 1000 * hrtime[0] + hrtime[1] / 1000000;
                }
            }
        });

        testRunner.on('suite:start', function (data) {
            console.log('\n[' + data.suite.name + ']');
        });
        testRunner.on('test:completed', function (data) {
            console.log(data.test.name + ': \t' + data.durration + 'ms');
        });

        // add test suites
        testRunner.add([
            alchemy('tests.InstanceCreation').brew().getTestSuite(),
            alchemy('tests.PropertyAccess').brew().getTestSuite(),
        ]);

        return testRunner;
    }
}());
