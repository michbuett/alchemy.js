/* global module */
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        availabletasks: {
            tasks: {}
        },

        // ////////////////////////////////////////////////////////////////////
        // JSHint (documented at http://www.jshint.com/docs/) and JSONLint
        jsonlint: {
            all: {
                files: [{
                    src: 'package.json'
                }]
            }
        },

        jshint: {
            files: [
                'Gruntfile.js',
                'lib/**/*.js',
                'tests/**/*.js',
                // no check for 3rd party libs
                '!lib/vendor/**/*.js',
                '!tests/vendor/**/*.js',
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },


        // ////////////////////////////////////////////////////////////////////
        // configure unit tests
        jasmine: {
            options: {
                display: 'short',
                keepRunner: true,
                summary: true,

                helpers: [
                    'tests/helper/compatibility.helper.js',
                    'tests/vendor/jquery-2.0.3.js',
                    'tests/vendor/*.js',
                    'lib/vendor/*.js'
                ],

                specs: [
                    'tests/specs/**/*.spec.js',
                ],
            },

            all: {
                src: [
                    'lib/core/Alchemy.js',
                    'lib/core/*.js',
                    'lib/web/*.js',
                    'lib/ecs/*.js',
                ],

                options: {
                    template: require('grunt-template-jasmine-nml'),
                }
            },

            coverage: {
                src: [
                    'lib/core/Alchemy.js',
                    'lib/core/*.js',
                    'lib/web/*.js',
                    'lib/ecs/*.js',
                ],

                options: {
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        template: require('grunt-template-jasmine-nml'),
                        templateOptions: {
                            pathmap: {
                                'lib/': '.grunt/grunt-contrib-jasmine/lib/',
                            }
                        },
                        coverage: 'reports/coverage/coverage.json',
                        report: [{
                            type: 'html',
                            options: {
                                dir: 'reports/coverage/html',
                            }
                        }, {
                            type: 'lcovonly',
                            options: {
                                dir: 'reports/coverage/lcov',
                            }
                        }],
                        thresholds: {
                            lines: 85,
                            statements: 85,
                            branches: 80,
                            functions: 90
                        },
                    }
                },
            },
        },

        jasmine_node: {
            options: {
                forceExit: true,
                match: '.',
                matchall: false,
                extensions: 'js',
                useHelpers: true,
                specNameMatcher: 'spec',
            },
            core: [
                'tests/helper/',
                'tests/specs/core/'
            ]
        },

        // ////////////////////////////////////////////////////////////////////
        // configure watcher
        watch: {
            json: {
                files: ['**/.json'],
                tasks: ['jsonlint'],
            },

            js: {
                files: ['Gruntfile.js', 'lib/**/*js', 'tests/**/*js'],
                tasks: ['jshint', 'jasmine_node', 'jasmine:all'],
            },
        },

        // ////////////////////////////////////////////////////////////////////
        // export coverage report
        coveralls: {
            travis: {
                src: 'reports/coverage/lcov/*.info',
                options: {
                    force: true,
                }
            }
        },
    });


    // load grunt plugins
    grunt.loadNpmTasks('grunt-available-tasks');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-jasmine-node-new');
    grunt.loadNpmTasks('grunt-jsonlint');
    grunt.loadNpmTasks('grunt-coveralls');

    // define aliases
    grunt.registerTask('lint', ['jsonlint', 'jshint']);
    grunt.registerTask('test', ['lint', 'jasmine_node', 'jasmine:coverage']);
    grunt.registerTask('default', ['availabletasks']);
};
