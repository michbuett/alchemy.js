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
                // display: 'short',
                keepRunner: true,
                summary: true,

                helpers: [
                    'tests/helper/compatibility.helper.js',
                    'tests/helper/map.helper.js',
                    'tests/vendor/jquery-2.0.3.js',
                    'tests/vendor/*.js',
                ],

                specs: [
                    'tests/specs/**/*.all.js',
                    'tests/specs/**/*.browser.js',
                    'tests/specs_old/**/*.spec.js',
                ],
            },

            debug: { // for debugging tests
                src: [
                    'old/**/*.js',
                    'lib/**/*.js',
                ],

                options: {
                    template: require('grunt-template-jasmine-nml'),
                }
            },

            coverage: {
                src: [
                    'old/**/*.js',
                    'lib/**/*.js',
                ],

                options: {
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        template: require('grunt-template-jasmine-nml'),
                        templateOptions: {
                            pathmap: {
                                'lib/': '.grunt/grunt-contrib-jasmine/lib/',
                                'old/': '.grunt/grunt-contrib-jasmine/old/',
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
                            lines: 95,
                            statements: 95,
                            branches: 95,
                            functions: 95
                        },
                    }
                },
            },
        },

        jasmine_nodejs: {
            options: {
                specNameSuffix: 'all.js',
                helperNameSuffix: 'helper.js',
                useHelpers: true,
                reporters: {
                    console: {
                        colors: true,
                        verbosity: 2,
                    },
                },
            },
            all: {
                helpers: [ 'tests/helper/compatibility.helper.js' ],
                specs: [ 'tests/specs/**' ],
            }
        },

        // ////////////////////////////////////////////////////////////////////
        // configure watcher
        watch: {
            json: {
                files: ['**/.json'],
                tasks: ['jsonlint'],
            },

            js: {
                files: ['Gruntfile.js', 'lib/**/*js', 'old/**/*js', 'tests/**/*js'],
                tasks: ['lint', 'jasmine_nodejs', 'jasmine:debug'],
            },
        },

        connect: {
            dev: {
                options: {
                    livereload: true,
                },
            }
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
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-jasmine-nodejs');
    grunt.loadNpmTasks('grunt-jsonlint');

    // define aliases
    grunt.registerTask('default', ['availabletasks']);
    grunt.registerTask('dev', ['connect', 'watch']);
    grunt.registerTask('lint', ['jsonlint', 'jshint']);
    grunt.registerTask('test', ['lint', 'jasmine_nodejs', 'jasmine:coverage']);
};
