module.exports=function(grunt){

    // Read the current versions from each subrepo's respective config file
    var versions = {
        chrome:  grunt.file.readJSON( 'chrome/chrome/manifest.json' ).version,
        firefox: grunt.file.readJSON( 'firefox/firefox/package.json' ).version
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        versions: versions,
        shell: {
            chrome: {                    
                options: {                      
                    stdout: false
                },
                command: [
                    'cd chrome',
                    'zip -r releases/chrome-<%= versions.chrome %>.zip chrome',
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
                    'cfx xpi --update-link https://s3.amazonaws.com/buffer-static/extensions/firefox/buffer-<%= versions.firefox %>.xpi --update-url https://s3.amazonaws.com/buffer-static/extensions/firefox/buffer.update.rdf',
                    'mv buffer.xpi buffer-<%= versions.firefox %>.xpi',
                    'mv buffer-<%= versions.firefox %>.xpi ../releases',
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

            // Update the shared code repos by doing a git pull in each subdirectory
            update_shared_repos: {
                options: {
                    stdout: true
                },
                command: [
                    'cd chrome/chrome/data/shared',
                    'git pull',
                    'cd ../../../../',
                    'cd firefox/firefox/data/shared',
                    'git pull',
                    'cd ../../../../',
                    'cd safari/safari/buffer.safariextension/data/shared',
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
    grunt.registerTask('version-exists', 'Check if an extension\'s version exists', function(version){
        var paths = {
            chrome:  'chrome/releases/chrome-' + versions.chrome + '.zip',
            firefox: 'firefox/releases/buffer-' + versions.firefox + '.xpi'
        };

        if (version in paths && !grunt.file.exists( paths[ version ] )){
            return true;
        }

        grunt.log.error('Build at that version number exists. Please increment version number.');
        return false;
    });

    //  Load Shell commands plugin
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-mocha');

    // Tasks
    grunt.registerTask('default',       'Build all extentions', [
        'mocha',
        'version-exists:chrome',
        'shell:chrome',
        'version-exists:firefox',
        'shell:firefox'
    ]);
    grunt.registerTask('chrome',        'Build the chrome extension',   ['mocha', 'version-exists:chrome', 'shell:chrome']);
    grunt.registerTask('firefox',       'Build the firefox extension',  ['mocha', 'version-exists:firefox', 'shell:firefox']);
    grunt.registerTask('firefox-test',  'Test the build in firefox',    ['shell:firefox_test']);
    grunt.registerTask('update-shared', 'Pull shared repo in all extensions', ['shell:update_shared_repos',]);
};
