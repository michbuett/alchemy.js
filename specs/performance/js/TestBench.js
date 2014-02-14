/* global Benchmark, $ */
(function () {
    'use strict';

    var alchemy = require('alchemy');
    alchemy.formula.add({
        name: 'performance.TestBench',
        overrides: function () {

            function printSuite(suite, index) {
                var $suiteCt = $([
                    '<div id="', createId(suite.name), '" class="suite">',
                    '<button type="button" class="run" data-index="', index, '">RUN</button>',
                    '<span class="suite-name">', suite.name, '</span>',
                    '<span class="suite-result"></span>',
                    '</div>'
                ].join('')).appendTo($('body'));

                for (var i = 0; i < suite.tests.length; i++) {
                    var test = suite.tests[i];
                    $suiteCt.append([
                        '<div id="', createId(suite.name, test.name), '" class="test">',
                        '<span class="test-name">', test.name, '</span>',
                        '<div class="test-results">waiting...</div>',
                        '</div>'
                    ].join(''));
                }
            }

            function createId() {
                var raw = Array.prototype.slice.call(arguments, 0).join('#');
                return btoa(raw).replace(/=/g, '');
            }

            function onStartBenchmark(event) {
                var test = event.target;
                $('.test.running').removeClass('running');
                $('#' + event.target.id).addClass('running');
                $('#' + test.id + ' .test-results').html('running ...');
            }

            function onCompleteBenchmark(event) {
                var test = event.target;
                var ops = String(Math.round(test.hz)).replace(/(\d)(?=(\d{3})+$)/g, '$1,');

                $('.test.running').removeClass('running');
                $('#' + test.id).addClass('completed');
                $('#' + test.id + ' .test-results').html(ops + ' ops/sec');
            }

            function onError(event) {
                console.error(event.message);
            }

            function runNextTestSuit(suites) {
                if (suites.length === 0) {
                    return;
                }
                var suite = suites.shift();

                // initialize Benchmark.js test suite
                var bs = new Benchmark.Suite(suite.name, {
                    id: createId(suite.name),
                    onComplete: function () {
                        var fastest = this.filter('fastest')[0];
                        if (fastest) {
                            $('#' + this.id + ' .suite-result').html('Fastest is ' + fastest);
                            $('#' + fastest.id).addClass('fastest');
                        }
                        runNextTestSuit(suites);
                    }
                });

                // add test cases
                for (var i = 0; i < suite.tests.length; i++) {
                    var test = suite.tests[i];
                    bs.add(suite.name + ': ' + test.name, alchemy.mix({}, test, {
                        id: createId(suite.name, test.name),
                        onStart: onStartBenchmark,
                        onComplete: onCompleteBenchmark,
                        onError: onError,
                        initCount: 100,
                    }));
                }

                // run test suite
                bs.run({
                    async: true
                });
            }

            return {
                init: function () {
                    alchemy.each(this.testSuites, printSuite);

                    var me = this;
                    $('button.run').click(function (event) {
                        me.run($(event.target).data().index);
                    });
                },

                run: function (index) {
                    var suite = this.testSuites[index];
                    if (suite) {
                        runNextTestSuit([suite]);
                    }
                },

                runAll: function () {
                    runNextTestSuit(this.testSuites);
                }
            };
        }
    });
}());
