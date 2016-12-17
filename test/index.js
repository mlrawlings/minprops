var fs = require('fs-extra');
var walk = require('fs-walker');
var path = require('path');
var minprops = require('../');
var expect = require('chai').expect;
var src = path.join(__dirname, 'src');
var min = path.join(__dirname, 'min');
var testFiles = [];

describe('minprops', () => {
  fs.copySync(src, min);
  walk.files.sync(min).forEach(stats => {
    var filename = stats.fullname;
    var basename = path.basename(filename);
    var dirname = path.dirname(filename);

    if(/\.js$/.test(basename)) {
      var source = fs.readFileSync(filename, 'utf-8');
      var minified = minprops(source, filename);
      it(`Saved ${source.length-minified.length} bytes when minifying ${filename.replace(min, '')}`, () => {
        fs.writeFileSync(filename, minified);
        expect(minified.length).to.be.at.most(source.length);
      });
    }

    if(basename === 'test.js' || dirname === 'test') {
      testFiles.push(filename);
    }
  });
});

describe('test modules', () => {
  testFiles.forEach(file => require(file));
});
