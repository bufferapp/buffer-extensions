/* jshint node:true */
var path = require('path');

var CONFIG_FILE = {
  CHROME:  'chrome/chrome/manifest.json',
  FIREFOX: {
    SRC: 'firefox/firefox/src/package.json',
    DIST: 'firefox/firefox/dist/package.json'
  },
  SAFARI:  'safari/safari/buffer.safariextension/Info.plist'
};

// This config is to switch parameters in the package.json between the
// self-hosted and Mozilla Add-on site hosted extension
var FIREFOX_CONFIG = {
  HOSTED: {
    title: "Buffer for Firefox",
    id: "firefox@buffer",
    name: "buffer-for-firefox",
    updateURL: "https://s3.amazonaws.com/buffer-static/extensions/firefox/buffer.update.rdf"
  },
  ADDON: {
    title: "Buffer",
    id: "jid1-zUyU7TGKwejAyA@jetpack",
    name: "buffer"
  }
};


module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({

    pkg: pkg,

    FIREFOX_CONFIG: FIREFOX_CONFIG,

    FIREFOX_STATIC_DIR: 'https://s3.amazonaws.com/buffer-static/extensions/firefox/',

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
      'firefox-hosted': {
        options: {
          stdout: true
        },
        command: [
          'cd firefox/firefox/src',
          'jpm xpi',
          'mv <%= FIREFOX_CONFIG.HOSTED.id %>-<%= pkg.version %>.xpi ../../releases/buffer-<%= pkg.version %>.xpi',
          'cd ../../../'
        ].join('&&')
      },
      'firefox-addon': {
        options: {
          stdout: true
        },
        command: [
          'cd firefox/firefox/src',
          'jpm xpi',
          'mv <%= FIREFOX_CONFIG.ADDON.id %>-<%= pkg.version %>.xpi ../../releases/buffer-<%= pkg.version %>-addon-edition.xpi',
          'cd ../../../'
        ].join('&&')
      },
      firefox_test: {
        options: {
          stdout: true
        },
        command: [
          'cd firefox/firefox/src',
          'jpm test',
          'cd ../../../'
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
          'cd ' + path.join(__dirname, 'firefox/firefox/src/data/shared'),
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

    concat: {
      firefoxBackgroundPage: {
        src: ['firefox/firefox/dist/lib/main.js', 'firefox/firefox/dist/data/shared/buffermetrics-bg-shim.js', 'firefox/firefox/dist/data/shared/buffermetrics.js'],
        dest: 'firefox/firefox/dist/lib/main.js'
      }
    },

    copy: {
      firefoxSrcToDist: {
        cwd: 'firefox/firefox/src/',
        src: '**',
        dest: 'firefox/firefox/dist/',
        expand: true
      }
    },

    clean: {
      firefoxDist: 'firefox/firefox/dist/'
    }
  });

  // Warns the developer to bump the version number if there is already a build
  grunt.registerTask('version-exists',
    'Check if an extension\'s version exists', function(browser) {

    var paths = {
      chrome:  'chrome/releases/chrome-' + pkg.version + '.zip',
      firefox: 'firefox/releases/buffer-' + pkg.version + '.xpi',
      firefox_addon: 'firefox/releases/buffer-' + pkg.version + '-addon-edition.xpi'
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
      var firefoxConfig = grunt.file.readJSON( CONFIG_FILE.FIREFOX.SRC );
      firefoxConfig.version = version;
      grunt.file.write(CONFIG_FILE.FIREFOX.SRC, JSON.stringify(firefoxConfig, null, '  '));
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

  grunt.registerTask('set-firefox-config',
    'Updates the Firefox config package.json for a specific build', function(version) {

    // The addon store version is the default in the repo
    if (!version) version = 'ADDON';
    version = version.toUpperCase();

    if (Object.keys(FIREFOX_CONFIG).indexOf(version) === -1)
      throw new Error('"' + version +'" is not a valid configuration key');

    var firefoxConfig = grunt.file.readJSON( CONFIG_FILE.FIREFOX.DIST );

    for (var key in FIREFOX_CONFIG[version]) {
      firefoxConfig[key] = FIREFOX_CONFIG[version][key];
    }

    grunt.file.write(CONFIG_FILE.FIREFOX.SRC, JSON.stringify(firefoxConfig, null, '  '));

    grunt.log.ok('Firefox package.json successfully updated to ' + version);
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

  grunt.registerTask('firefox-hosted', 'Build the hosted firefox extension', [
    'version-exists:firefox',
    'set-firefox-config:hosted',
    'shell:firefox-hosted'
  ]);

  grunt.registerTask('firefox-addon', 'Build the addon listed firefox extension', [
    'version-exists:firefox_addon',
    'set-firefox-config:addon',
    'shell:firefox-addon'
  ]);


  grunt.registerTask('firefox', 'Build the firefox extension', [
    'mocha',
    'update-versions:firefox',
    'clean:firefoxDist',
    'copy:firefoxSrcToDist',
    'concat:firefoxBackgroundPage',
    'firefox-hosted',
    'firefox-addon'
  ]);

  grunt.registerTask('firefox-test', 'Test the build in firefox', [
    'shell:firefox_test'
  ]);

  grunt.registerTask('update-shared', 'Pull shared repo in all extensions', [
    'shell:update_shared_repos'
  ]);

  grunt.registerTask('update-repos', 'Pull latest changes in all repos', [
    'shell:update_browser_repos',
    'shell:update_shared_repos'
  ]);
};
