/* global describe, it, bufferData */
/* jshint -W030 */

var expect = chai.expect;

describe('buffer-overlay', function() {

  it('should not be configured for local testing', function(){

    var config = getOverlayConfig();

    expect( config.local ).to.be.false;

  });

});

describe('buffer-hover-button', function() {

  it('should properly match valid and invalid image urls', function(){

    var validImageUrls = [
      'http://image.com/image1.jpg',
      'http://image.com/image1.jpeg',
      'http://image.com/image1.gif',
      'http://image.com/image1.png',
      'http://image.com/image1',
      'http://image.com/image1.jpg?hey',
      'http://image.com/image1.jpg#hey',
      'http://image.com/image1.jpg?hey#hey',
      'http://image.com/image1.jpg#hey?hey',
      'http://image.com/image1.jpg:large',
      'http://image.com/image1.jpg:large?hey',
      'http://image.com:100/image1.jpg:large',
      'http://image.com:100/image1.jpg:large#hey',
      'https://cdn3.bigcommerce.com/s-1jfzv/images/stencil/1000x1000/products/10233/34922/charoite%201__99618.1504362835.JPG?c=2',
      'https://pbs.twimg.com/media/DMFnxirVAAAbNor.jpg:large',
      'https://scontent-cdg2-1.xx.fbcdn.net/v/t31.0-8/23550940_10155856485709253_636200936047235944_o.jpg?oh=7e771b570f04b998117e97e84b87bcf3&oe=5A9F7DAB',
    ];

    var invalidImageUrls = [
      'http://image.com/image1.svg',
      'http://image.com/image1.webp',
    ];

    validImageUrls.map(function(url) { expect(isValidImageUrl(url)).to.be.true; });
    invalidImageUrls.map(function(url) { expect(isValidImageUrl(url)).to.be.false; });
  });

});
