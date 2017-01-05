var minprops = require('.');

module.exports = function (lasso, pluginConfig) {
    lasso.addTransform({
        contentType: 'js',

        name: module.id,

        stream: false,

        transform: function(code, lassoContext) {
            var filePath = lassoContext.path;
            if (!filePath) {
                var dependency = lassoContext.dependency;
                if (dependency) {
                    filePath = dependency.file;
                }
            }

            if (!filePath) {
                return code;
            }

            return minprops(code, filePath);
        }
    });
};