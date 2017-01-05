var fs = require('fs');
var onlyTestName = process.env.TEST;
var path = require('path');

exports.scanDir = function(autoTestDir, run, options) {
    describe('autotest', function() {
        fs.readdirSync(autoTestDir)
            .forEach(function(name) {
                if (name.charAt(0) === '.') {
                    return;
                }

                var describeFunc = describe;
                var only = onlyTestName && name === onlyTestName;

                if (only) {
                    describeFunc = describe.only;
                }

                var dir = path.join(autoTestDir, name);

                describeFunc(`[${name}] `, function() {
                    if (!onlyTestName || only) {
                        run(dir);
                    }
                });
            });
    });
};