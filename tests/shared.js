/* global describe, it, bufferData */
/* jshint -W030 */

var expect = chai.expect;

describe('buffer-overlay', function() {

  it('should not be configured for local testing', function(){

    var config = getOverlayConfig();

    expect( config.local ).to.be.false;

  });

});