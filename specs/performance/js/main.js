(function () {
    'use strict';

    var alchemy = require('alchemy');

    ///////////////////////////////////////////////////////////////////////////
    // go go go
    alchemy.heatUp({
        path: {
            alchemy: '../../lib',
            performance: 'js',
            test: 'js/tests'
        },
        require: [
            'alchemy.core.MateriaPrima',
            'performance.TestBench',
            'test.InstanceCreation',
            'test.PropertyAccess',
        ],
        onReady: function () {

            ///////////////////////////////////////////////////////////////////////////
            // define test cases
            alchemy('performance.TestBench').brew({
                testSuites: [
                    alchemy('test.InstanceCreation').getTestSuite(),
                    alchemy('test.PropertyAccess').getTestSuite(),
                ]
            });
        }
    });
}());
