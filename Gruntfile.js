module.exports=function(grunt){

    // Current versions. Update when compiling new ones.
    var versions = {
        chrome: '2.3.26',
        firefox: '2.2.20',
        safari: '2.2.1'
    }

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
        }
      }
    });

    //  Load Shell commands plugin
    grunt.loadNpmTasks('grunt-shell');
    
    //  Defaulttask(s).
    grunt.registerTask('default',['shell']);
    grunt.registerTask('chrome',['shell:chrome']);
    grunt.registerTask('firefox',['shell:firefox']);
};