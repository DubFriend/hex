module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            options: {
                ignores: [
                    'lib/*.js',
                    'test/qunit-1.12.0.js',
                    'src/intro.js',
                    'src/outro.js'
                ]
            }
        },

        concat: {
            options: {
                separator: '\n'
            },
            dist: {
                src: [
                    'lib/jquery.mousewheel.js',
                    'src/intro.js',
                    'lib/jsmessage.js',
                    'src/define.js',
                    'src/function.js',
                    'src/model.js',
                    'src/draw.js',
                    'src/view.js',
                    'src/controller.js',
                    'src/event.js',
                    'src/public.js',
                    'src/outro.js',
                    'src/execute.js'
                ],
                dest: '<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    '<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },

        watch: {
            scripts: {
                files: ['**/*.js'],
                tasks: ['concat', 'uglify'],
                options: {
                    spawn: false,
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};
