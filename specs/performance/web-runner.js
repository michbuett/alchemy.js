(function () {
    'use strict';

    var root = '../../';
    var alchemy = require(root + 'lib/core/Alchemy.js');

    alchemy.heatUp({
        path: {
            alchemy: root + 'lib',
            tests: 'tests'
        },

        require: [
            'alchemy.benchmarking.TestRunner',
            'tests.PropertyAccess',
            'tests.InstanceCreation'
        ],

        onReady: function () {
            var testRunner = alchemy('alchemy.benchmarking.TestRunner').brew({
                timer: window.performance
            });

            // register listners for reporting etc...
            testRunner.on('start', function () {
                console.log('\n+++ Run Alchemy.js Performance Tests +++');
            });
            testRunner.on('suite:start', function (data) {
                console.log('\n[' + data.suite.name + ']');
            });
            testRunner.on('test:completed', function (data) {
                console.log(data.test.name + ': \t' + data.durration + 'ms');
            });
            testRunner.once('completed', function () {
                console.log('\n  ... verify test results ...');
                testRunner.run();
            });

            // add test suites
            testRunner.add([
                alchemy('tests.InstanceCreation').getTestSuite(),
                alchemy('tests.PropertyAccess').getTestSuite()
            ]);

            // and last but not least: start the runner
            testRunner.run();
        }
    });
}());
