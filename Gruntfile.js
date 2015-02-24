/* global module */
module.exports = function (grunt) {
    'use strict';

    var coreSrc = ['lib/core/Alchemy.js', 'lib/core/*.js'];
    var coreHelper = ['tests/helper/compatibility.helper.js'];
    var webSrc = ['lib/web/*.js', 'lib/ecs/*.js'];
    var webHelper = coreSrc.concat(coreHelper, [
        'tests/vendor/jquery-2.0.3.js',
        'tests/vendor/*.js',
        'lib/vendor/*.js'
    ]);

    var coverageThresholds = {
        lines: 85,
        statements: 85,
        branches: 80,
        functions: 90
    };

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
                keepRunner: true,
                display: 'none',
            },

            core: {
                src: coreSrc,
                options: {
                    display: 'short',
                    specs: 'tests/specs/core/**/*.spec.js',
                    helpers: coreHelper,
                },
            },

            web: {
                src: webSrc,
                options: {
                    specs: [
                        'tests/specs/web/**/*.spec.js',
                        'tests/specs/ecs/**/*.spec.js',
                    ],
                    display: 'full',
                    helpers: webHelper,
                },
            },

            core_coverage: {
                src: coreSrc,
                options: {
                    helpers: coreHelper,
                    specs: 'tests/specs/core/**/*.spec.js',
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'reports/core/coverage.json',
                        report: 'reports/core',
                        thresholds: coverageThresholds
                    }
                },
            },

            web_coverage: {
                src: webSrc,
                options: {
                    helpers: webHelper,
                    specs: [
                        'tests/specs/web/**/*.spec.js',
                        'tests/specs/ecs/**/*.spec.js',
                    ],
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'reports/web/coverage.json',
                        report: 'reports/web',
                        thresholds: coverageThresholds
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
            jsonlint: {
                files: ['**/.json'],
                tasks: ['jsonlint'],
            },

            jshint: {
                files: ['**/*.js'],
                tasks: ['jshint'],
            },

            jsCore: {
                files: ['lib/core/**/*.js', 'tests/specs/core/**/*.js'],
                tasks: ['jasmine_node', 'jasmine:core'],
            },

            jsWeb: {
                files: [
                    'lib/ecs/**/*.js',
                    'lib/web/**/*.js',
                    'tests/specs/ecs/**/*.js',
                    'tests/specs/web/**/*.js',
                ],
                tasks: ['jasmine:web'],
            },
        },
    });


    // load grunt plugins
    grunt.loadNpmTasks('grunt-available-tasks');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-jasmine-node-new');
    grunt.loadNpmTasks('grunt-jsonlint');

    // define aliases
    grunt.registerTask('lint', ['jsonlint', 'jshint']);
    grunt.registerTask('test', ['lint', 'jasmine_node', 'jasmine:core', 'jasmine:web']);
    grunt.registerTask('coverage', ['jasmine:core_coverage', 'jasmine:web_coverage']);
    grunt.registerTask('default', ['availabletasks']);
};
