/*global grunt*/
var NAME = 'alignme';
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        autoprefixer: {
            options: {
                browsers: ['> 5%'],
                cascade: false
            },
            debug: {
                src: './dist/' + NAME + '.debug.css',
                dest: './dist/' + NAME + '.debug.css'
            },
            min: {
                src: './dist/' + NAME + '.min.css',
                dest: './dist/' + NAME + '.min.css'
            }
        },
        connect: {
            server: {
                options: {
                    base: './',
                    port: 8000,
                    livereload: 36729,
                    open: {
                      target: 'http://localhost:8000/tests/manual/development.html'
                    }
                }
            }
        },
        sass: {
            debug: {
                options: {
                    sourceMap: true
                },
                src: './src/sass/' + NAME + '.scss',
                dest: './dist/' + NAME + '.debug.css'
            },
            min: {
                options: {
                    sourceMap: false
                },
                src: './src/sass/' + NAME + '.scss',
                dest: './dist/' + NAME + '.min.css'
            }
        },
        cssmin: {
            main: {
                src: './dist/' + NAME + '.min.css',
                dest: './dist/' + NAME + '.min.css'
            }
        },
        browserify: {
            debug: {
                src: './src/js/' + NAME + '.js',
                dest: './dist/' + NAME + '.debug.js',
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                }
            },
            min: {
                src: './src/js/' + NAME + '.js',
                dest: './dist/' + NAME + '.min.js',
                browserifyOptions: {
                    debug: false
                }
            },
            options: {
                banner: "// DON'T MODIFY THIS FILE!\n// MODIFY ITS SOURCE FILE!"
            }
        },
        uglify: {
            main: {
                src: './dist/' + NAME + '.min.js',
                dest: './dist/' + NAME + '.min.js'
            }
        },
        watch: {
            js: {
                files: ['./src/js/*.js'],
                tasks: ['browserify:debug']
            //},
            //sass: {
                //files: ['./src/sass/*.scss'],
                //tasks: ['sass:debug', 'autoprefixer:debug']
            }
        }
    });
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-sass');

    grunt.registerTask('build', [
        'browserify:min',
        'uglify'//,
        //'sass:min',
        //'autoprefixer:min',
        //'cssmin'
    ]);
    grunt.registerTask('default', ['build', 'connect', 'watch']);
};
