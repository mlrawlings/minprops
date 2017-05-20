"use strict";
const path = require('path');
const minpropsPackagesCache = {};
const lassoCachingFS = require('lasso-caching-fs');

const Minifier = require('./Minifier');
const cache = {};

function isObjectEmpty(o) {
    return Object.keys(o).length === 0;
}

function getMinpropsPackage(filename) {
    var dirname = path.dirname(filename);

    var minpropsPkg = minpropsPackagesCache[dirname];
    if (minpropsPkg) {
        return minpropsPkg;
    }

    var currentDir = dirname;
    while (true) {
        var packagePath = path.join(currentDir, 'package.json');
        var pkg = lassoCachingFS.readPackageSync(packagePath);
        if (pkg) {
            if (pkg.minprops) {
                minpropsPkg = pkg;
                minpropsPkg.__filename = packagePath;
                break;
            } else if (pkg.name) {
                break;
            }
        }

        var parentDir = path.dirname(currentDir);
        if (!parentDir || parentDir === currentDir) {
            break;
        }
        currentDir = parentDir;
    }

    minpropsPackagesCache[dirname] = minpropsPkg || null;

    return minpropsPkg;
}

function getMinifier(state) {
    var options = state.opts;
    var cacheKey = options.context;

    if (!options || isObjectEmpty(options)) {
        var filename = state.file.opts.filename;

        if (filename) {
            var minpropsPkg = getMinpropsPackage(filename);
            if (!minpropsPkg) {
                return undefined;
            }

            options = minpropsPkg.minprops;
            cacheKey = options.context || minpropsPkg.__filename;
        }
    }

    if (!options || options.enabled === false || !cacheKey) {
        return undefined;
    }

    return cache[cacheKey] || (cache[cacheKey] = new Minifier(options));
}

function minpropsBabelPlugin(babel) {
    var t = babel.types;

    return {
        name: "minprops",
        visitor: {
            // Infinity -> 1 / 0
            Identifier(path, state) {
                var minifier = getMinifier(state);

                if (!minifier) {
                    return;
                }

                var name = path.node.name;

                if (minifier.isMatch(name)) {
                    path.replaceWith(t.identifier(minifier.getShortProp(name)));
                }

            },

            Literal(path, state) {
                var value = path.node.value;
                if (typeof value !== 'string') {
                    return;
                }

                var minifier = getMinifier(state);

                if (!minifier) {
                    return;
                }

                if (minifier.isMatch(value)) {
                    path.replaceWith(t.stringLiteral(minifier.getShortProp(value)));
                }

            }
        }
    };
}

module.exports = minpropsBabelPlugin;