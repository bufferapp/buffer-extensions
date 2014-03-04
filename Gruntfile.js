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
            'cd ../']
            .join('&&')
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
        }
      }
    });

    //  Load Shell commands plugin
    grunt.loadNpmTasks('grunt-shell');
    
    // Tasks
    grunt.registerTask('default',       'Build all extentions',         ['shell']);
    grunt.registerTask('chrome',        'Build the chrome extension',   ['shell:chrome']);
    grunt.registerTask('firefox',       'Build the firefox extension',  ['shell:firefox']);
    grunt.registerTask('firefox-test',  'Test the build in firefox',    ['shell:firefox_test']);
};
