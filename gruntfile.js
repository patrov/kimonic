module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '',
                process: function (src, filepath) {
                    return '\n/* ' + filepath + ' */\n' + src;
                }
            },
            dist: {
                src: ['src/**/*.js'],
                dest: 'js/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n'
            },
            dist: {
                files: {
                    'min/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'specs/*.js'],
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'csslint', 'jasmine']
        },
        csslint: {
            strict: {
                options: {
                    import: 2
                },
                src: ['src/assets/css/*.css']
            }
        },
        jasmine: {
            test: {
                src: 'src/*.js',
                options: {
                    specs: 'specs/*.spec.js',
                    vendor: 'lib/**/*.js'
                }
            },
            istanbul: {
                src: '<%= jasmine.test.src %>',
                options: {
                    vendor: '<%= jasmine.test.options.vendor %>',
                    specs: '<%= jasmine.test.options.specs %>',
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'coverage/json/coverage.json',
                        report: [
                            {type: 'lcov', options: {dir: 'coverage'}},
                            {type: 'text-summary'}
                        ]
                    }
                }
            }
        },
        bower: {
            install: {}
        },
        coveralls: {
            options: {
                src: 'coverage/lcov.info',
                force: true
            }
        },
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-istanbul-coverage');

    grunt.registerTask('coverage', ['jasmine:istanbul']);
    grunt.registerTask('test', ['jshint', 'csslint', 'jasmine']);
    grunt.registerTask('travis', ['bower', 'jshint', 'csslint', 'jasmine', 'coveralls']);
    grunt.registerTask('install', ['bower']);
    grunt.registerTask('deploy', ['uglify']);
    grunt.registerTask('default', ['watch']);
};