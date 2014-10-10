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
            all: {
                src: [
                    'lib/core/Alchemy.js',
                    'lib/core/*.js',
                ],
                options: {
                    keepRunner: true,
                    specs: 'specs/**/*.spec.js',
                    template: 'tests/helper/SpecRunner.tpl',
                    helpers: [
                        'tests/helper/**/*.js'
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
                specNameMatcher: 'spec',
            },
            all: ['specs/']
        },

        // ////////////////////////////////////////////////////////////////////
        // configure watcher
        watch: {
            json: {
                files: ['**/*.json'],
                tasks: ['jsonlint'],
            },

            js: {
                files: ['**/*.js'],
                tasks: ['jshint', 'jasmine'],
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
    grunt.registerTask('test', ['jsonlint', 'jshint']);
    grunt.registerTask('default', ['availabletasks']);
};
