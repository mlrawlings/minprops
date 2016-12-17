var through = require('through2');
var minprops = require('.');

module.exports = function(file) {
    return through((buf, enc, next) =>
        next(null, minprops(buf.toString('utf-8'), file))
    );
};