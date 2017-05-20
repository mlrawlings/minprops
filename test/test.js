const babel = require("babel-core");
const fs = require('fs-extra');
const walk = require('fs-walker');
const path = require('path');
const plugin = require('../src/index');
const expect = require('chai').expect;
const autotest = require('./util/autotest');

const generatedDir = path.join(__dirname, 'min');
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
                    var minified = babel.transform(source, {
                        plugins: [plugin],
                        filename: filename
                    }).code;

                    var savedBytes = source.length - minified.length;
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