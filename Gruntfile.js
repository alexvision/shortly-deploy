module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    //DUPLICATED FUNCTIONALITY WITH UGLIFY
    // concat: {
    //   options: {
    //     separator: ';'
    //   },

    //   dist: {
    //     src: [
    //       'public/lib/*.js'
    //     ],
    //     dest: 'prod/lib/production.js'
    //   }
    // },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
      },
      build: {
        files: {
          'min/production.min.js': ['public/lib/*.js']
        }
      }
    },

    jshint: {
      files: [
        // Add filespec list here
        'public/**/client/*.js',
        'test/*.js',
        'lib/*.js',
        'app/**/*.js',
        'app/*.js',
        '**.js'
      ],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/*/*.js',
          'public/dist/**/*.js',
        ]
      }
    },

    cssmin: {
        options: {
        banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
      },
      build: {
        files: {
          'min/style.min.css': 'public/style.css'
        }
      }
    },

    'string-replace': {
      inline: {
        files: {
          'views/layout.ejs': 'views/layout.ejs'
        },
        options: {
          replacements: [
              {
                  pattern: '<!--start PROD imports ',
                  replacement: '<!--start PROD imports-->'
              },
              {
                  pattern: ' end PROD imports-->',
                  replacement: '<!--end PROD imports-->'
              },
              {
                  pattern: '<!--start DEV imports-->',
                  replacement: '<!--start DEV imports '
              },
              {
                  pattern: '<!--end DEV imports-->',
                  replacement: ' end DEV imports-->'
              }
          ]
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          // 'concat',
          'uglify',
          'string-replace',
          'mochaTest'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
        command:[ 
        'git add .',
        'git commit -m "AUTOMATED DEPLOYMENT TO PRODUCTION"',
        'git push azure master',
        'asdf1234'
        ].join('&&')
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('test', [
    'mochaTest',
    'jshint'
  ]);

  grunt.registerTask('build', [
    //'concat',
    'uglify',
    'cssmin',
    'string-replace'
  ]);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      // add your production server task here
      grunt.task.run([ 'shell' ])
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
      // add your production server task here
      'test',
      'build',
      'upload'
  ]);


};
