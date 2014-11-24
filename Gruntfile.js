/* jshint node:true */
var path = require('path');

module.exports = function(grunt) {

  var configFile = {
    chrome:  'chrome/chrome/manifest.json',
    firefox: 'firefox/firefox/package.json',
    safari:  'safari/safari/buffer.safariextension/Info.plist'
  }

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: pkg,
    shell: {
      chrome: {                    
        options: {                      
          stdout: false
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
          'cd sdks/firefox',
          'source bin/activate',
          'cd ../../firefox/firefox',
          'cfx xpi --update-link https://s3.amazonaws.com/buffer-static/extensions/firefox/buffer-<%= pkg.version %>.xpi --update-url https://s3.amazonaws.com/buffer-static/extensions/firefox/buffer.update.rdf',
          'mv buffer.xpi buffer-<%= pkg.version %>.xpi',
          'mv buffer-<%= pkg.version %>.xpi ../releases',
          'cd ../../'
        ].join('&&')
      },
      firefox_test: {
        options: {
          stdout: true
        },
        command: [
          'cd sdks/firefox',
          'source bin/activate',
          'cd ../../firefox/firefox',
          'cfx run'
        ].join('&&')
      },

      update_browser_repos: {
        options: {
          stdout: true
        },
        command: [
          'cd ' + path.join(__dirname, 'chrome'),
          'git pull',
          'cd ' + path.join(__dirname, 'firefox'),
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
          'cd ' + path.join(__dirname, 'firefox/firefox/data/shared'),
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
    }
  });

  // Warns the developer to bump the version number if there is already a build
  grunt.registerTask('version-exists', 
    'Check if an extension\'s version exists', function(browser) {

    var paths = {
      chrome:  'chrome/releases/chrome-' + pkg.version + '.zip',
      firefox: 'firefox/releases/buffer-' + pkg.version + '.xpi'
    };

    if (browser in paths && !grunt.file.exists( paths[ browser ] )){
      return true;
    }

    grunt.log.error('Build at that version number exists. Please increment version number.');
    return false;
  });


  var updateVersion = {

    chrome: function(version) {
      var chromeConfig = grunt.file.readJSON( configFile.chrome );
      chromeConfig.version = version;
      grunt.file.write(configFile.chrome, JSON.stringify(chromeConfig, null, '  '));
    },

    firefox: function(version) {
      var firefoxConfig = grunt.file.readJSON( configFile.firefox );
      firefoxConfig.version = version;
      grunt.file.write(configFile.firefox, JSON.stringify(firefoxConfig, null, '  '));
    },

    safari: function(version) {
      var safariConfigXml = grunt.file.read(configFile.safari);

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
      grunt.file.write(configFile.safari, safariConfigXml);
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

  // Tasks
  grunt.registerTask('default',       'Build all extentions', [
    'mocha',
    'update-versions',
    'version-exists:chrome',
    'shell:chrome',
    'version-exists:firefox',
    'shell:firefox'
  ]);

  grunt.registerTask('chrome',        'Build the chrome extension',   [
    'mocha',
    'update-versions:chrome',
    'version-exists:chrome',
    'shell:chrome'
  ]);
  
  grunt.registerTask('firefox',       'Build the firefox extension',  [
    'mocha',
    'update-versions:firefox',
    'version-exists:firefox',
    'shell:firefox'
  ]);

  grunt.registerTask('firefox-test',  'Test the build in firefox',    [
    'shell:firefox_test'
  ]);

  grunt.registerTask('update-shared', 'Pull shared repo in all extensions', [
    'shell:update_shared_repos'
  ]);

  grunt.registerTask('update-repos',  'Pull latest changes in all repos', [
    'shell:update_browser_repos',
    'shell:update_shared_repos'
  ]);
};
