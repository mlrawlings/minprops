var fs = require('fs-extra');
var walk = require('fs-walker');
var path = require('path');
var minprops = require('../');
var expect = require('chai').expect;
var autotest = require('./util/autotest');

var generatedDir = path.join(__dirname, 'min');
try {
    fs.removeSync(generatedDir);
} catch(e) {}

describe('minprops', () => {
    autotest.scanDir(
        path.join(__dirname, 'autotest'),
        function(dir) {
            var basename = path.basename(dir);
            var minDir = path.join(generatedDir, basename);
            fs.copySync(dir, minDir);
            var expectedDir = path.join(minDir, 'expected');
            fs.removeSync(expectedDir);

            var totalSavedBytes = 0;
            var testFiles = [];

            walk.files.sync(minDir).forEach((stats) => {
                var filename = stats.fullname;
                var basename = path.basename(filename);
                var dirname = path.dirname(filename);
                var relativePath = path.relative(minDir, filename);

                if (/\.js$/.test(basename) && !/expected/.test(basename)) {
                    var source = fs.readFileSync(filename, 'utf-8');
                    var minified = minprops(source, filename);
                    var savedBytes = source.length-minified.length;
                    totalSavedBytes += savedBytes;

                    fs.writeFileSync(filename, minified);

                    var expectedFilename = path.join(dir, 'expected', path.dirname(relativePath), path.basename(relativePath));

                    var expectedSrc;

                    try {
                        expectedSrc = fs.readFileSync(expectedFilename, { encoding: 'utf8' });
                    } catch(e) {
                        expectedSrc = minified;
                        fs.ensureDirSync(path.dirname(expectedFilename));
                        fs.writeFileSync(expectedFilename, expectedSrc, { encoding: 'utf8' });
                    }

                    it(`should minify ${relativePath} (saved ${savedBytes} bytes)`, () => {
                        expect(minified.length).to.be.at.most(source.length);
                        expect(minified).to.equal(expectedSrc);
                    });

                    if (basename === 'test.js' || dirname === 'test') {
                        testFiles.push(filename);
                    }
                }
            });

            expect(totalSavedBytes >= 0).to.equal(true);

            describe('tests', () => {
                testFiles.forEach(file => require(file));
            });
        });
});