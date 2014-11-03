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
            files: ['Gruntfile.js', 'lib/**/*.js', 'tests/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },


        // ////////////////////////////////////////////////////////////////////
        // configure unit tests
        jasmine: {
            core: {
                src: [
                    'lib/core/Alchemy.js',
                    'lib/core/*.js',
                ],
                options: {
                    keepRunner: true,
                    specs: 'tests/specs/core/**/*.spec.js',
                    helpers: [
                        'tests/helper/compatibility.helper.js'
                    ],
                },
            },

            web: {
                src: [
                    'lib/core/Alchemy.js',
                    'lib/core/*.js',
                    'lib/web/*.js',
                ],
                options: {
                    keepRunner: true,
                    specs: 'tests/specs/web/**/*.spec.js',
                    helpers: [
                        'tests/helper/compatibility.helper.js'
                    ],
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
                tasks: ['jasmine_node', 'jasmine'],
            },

            jsWeb: {
                files: ['lib/web/**/*.js', 'tests/specs/web/**/*.js'],
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
    grunt.registerTask('test', ['lint', 'jasmine_node', 'jasmine']);
    grunt.registerTask('default', ['availabletasks']);
};
