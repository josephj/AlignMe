/*global grunt*/
var NAME = 'alignme';
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    base: './',
                    port: 8001,
                    livereload: 36729,
                    open: {
                      target: 'http://localhost:8001/tests/manual/development.html'
                    }
                }
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
                dest: './dist/' + NAME + '.js',
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
                src: './dist/' + NAME + '.js',
                dest: './dist/' + NAME + '.min.js'
            }
        },
        watch: {
            options: {
                livereload: 36729
            },
            js: {
                files: ['./src/js/*.js'],
                tasks: ['browserify:debug']
            }
        }
    });
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('build', [
        'browserify:min',
        'uglify',
    ]);
    grunt.registerTask('default', ['build', 'connect', 'watch']);
};
