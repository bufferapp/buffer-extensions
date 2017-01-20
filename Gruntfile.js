/* jshint node:true */
var path = require('path');

var CONFIG_FILE = {
  CHROME:  'chrome/chrome/manifest.json',
  SAFARI:  'safari/safari/buffer.safariextension/Info.plist'
};

module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({

    pkg: pkg,

    shell: {
      chrome: {
        options: {
          stdout: true
        },
        command: [
          'cd chrome',
          'zip -r releases/chrome-<%= pkg.version %>.zip chrome',
          'cd ../'
        ].join('&&')
      },
      firefox: {
        options: {
          stdout: true
        },
        command: [
          'cd chrome/chrome',
          'zip -r ../releases/firefox-<%= pkg.version %>.zip .',
          'cd ../../'
        ].join('&&')
      },

      update_browser_repos: {
        options: {
          stdout: true
        },
        command: [
          'cd ' + path.join(__dirname, 'chrome'),
          'git pull',
          'cd ' + path.join(__dirname, 'safari'),
          'git pull'
        ].join('&&')
      },

      update_shared_repos: {
        options: {
          stdout: true
        },
        command: [
          'cd ' + path.join(__dirname, 'chrome/chrome/data/shared'),
          'git pull',
          'cd ' + path.join(__dirname, 'safari/safari/buffer.safariextension/data/shared'),
          'git pull'
        ].join('&&')
      }
    },

    mocha: {
      test: {
        src: ['tests/**/*.html']
      },
      options: {
        run: true
      }
    },
  });

  // Warns the developer to bump the version number if there is already a build
  grunt.registerTask('version-exists',
    'Check if an extension\'s version exists', function(browser) {

    var paths = {
      chrome:  'chrome/releases/chrome-' + pkg.version + '.zip',
      firefox: 'chrome/releases/firefox-' + pkg.version + '.zip',
    };

    if (browser in paths && !grunt.file.exists( paths[ browser ] )){
      return true;
    }

    grunt.log.error('Build at that version number exists. Please increment version number.');
    return false;
  });


  var updateVersion = {

    chrome: function(version) {
      var chromeConfig = grunt.file.readJSON( CONFIG_FILE.CHROME );
      chromeConfig.version = version;
      grunt.file.write(CONFIG_FILE.CHROME, JSON.stringify(chromeConfig, null, '  '));
    },

    firefox: function(version) {
      var firefoxConfig = grunt.file.readJSON( CONFIG_FILE.CHROME );
      firefoxConfig.version = version;
      grunt.file.write(CONFIG_FILE.CHROME, JSON.stringify(firefoxConfig, null, '  '));
    },

    safari: function(version) {
      var safariConfigXml = grunt.file.read(CONFIG_FILE.SAFARI);

      // Replace the version in the xml string
      safariConfigXml = safariConfigXml
        .replace(
          /(<key>CFBundleShortVersionString<\/key>\n\t<string>).*(<\/string>)/gi,
          '$1' + version + '$2'
        )
        .replace(
          /(<key>CFBundleVersion<\/key>\n\t<string>).*(<\/string>)/gi,
          '$1' + version + '$2'
        );
      grunt.file.write(CONFIG_FILE.SAFARI, safariConfigXml);
    }

  };

  grunt.registerTask('update-versions',
    'Updates versions in each extension\'s config file', function(browser) {

    var version = pkg.version;

    if (browser in updateVersion) {
      return updateVersion[ browser ](version);
    }

    for (var key in updateVersion) {
      updateVersion[ key ](version);
    }

  });

  //  Load Shell commands plugin
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Tasks
  grunt.registerTask('default', 'Build all extensions', [
    'chrome',
    'firefox'
  ]);

  grunt.registerTask('chrome', 'Build the chrome extension', [
    'mocha',
    'update-versions:chrome',
    'version-exists:chrome',
    'shell:chrome'
  ]);

  grunt.registerTask('firefox', 'Build the firefox extension', [
    'mocha',
    'update-versions:firefox',
    'version-exists:firefox',
    'shell:firefox'
  ]);

  grunt.registerTask('update-shared', 'Pull shared repo in all extensions', [
    'shell:update_shared_repos'
  ]);

  grunt.registerTask('update-repos', 'Pull latest changes in all repos', [
    'shell:update_browser_repos',
    'shell:update_shared_repos'
  ]);
};
