'use strict';

var fs = require('fs');
var path = require('path');
var minpropsPackagesCache = {};
var lassoCachingFS = require('lasso-caching-fs');
var escapeStringRegexp = require('escape-string-regexp');
var chars = getChars();
var contexts = {};
var realpathCache = {};

module.exports = minprops;

function minprops(source, filename) {
    var minpropsPkg = getMinpropsPackage(path.dirname(filename));
    if (!minpropsPkg) {
        return source;
    }

    var context = getPackageContext(minpropsPkg);
    return replaceProps(source, context);
}

function realpathSyncCached(filePath) {
    var realPath = realpathCache[filePath];
    if (realPath === undefined) {
        try {
            realPath = fs.realpathSync(filePath);
        } catch(e) {
            realPath = filePath;
        }
    }

    realpathCache[filePath] = realPath;

    return realPath;
}

function getMinpropsPackage(dirname) {
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

function replaceProps(source, context) {
    return source.replace(context.match, (str, prop) => {
        return getShortProp(prop, context);
    });
}

function getPackageContext(minpropsPackage) {
    var key = realpathSyncCached(minpropsPackage.__dirname);
    var options = minpropsPackage.minprops;
    var context = contexts[key];
    if (!context) {
        context = contexts[key] = {
            currentIndex: 0,
            props: {},
            exclude: indexArray(options.exclude),
            match: createRegex(options.match),
            prefix: options.prefix || ''
        };
    }

    return context;
}

function indexArray(array) {
    var index = {};
    if (array) {
        array.forEach(item => {
            index[item] = true;
        });
    }

    return index;
}

function createRegex(prefix) {
    prefix = prefix || '$__';
    return new RegExp(escapeStringRegexp(prefix)+'([$\\w]+)', 'g');
}

function getShortProp(name, context) {
    var shortProp = context.props[name];

    if (!shortProp) {
        do {
            shortProp = context.prefix + calcShortProp(context.currentIndex++);
        } while(context.exclude[shortProp]);

        context.props[name] = shortProp;
    }

    return shortProp;
}

function calcShortProp(index) {
    var prop = chars[index % chars.length];
    while(index >= chars.length) {
        index = Math.floor(index/chars.length)-1;
        prop = chars[index % chars.length] + prop;
    }
    return prop;
}

function getChars() {
    var chars = ['_'];
    var lowerA = 'a'.charCodeAt(0);
    var lowerZ = 'z'.charCodeAt(0);
    var upperA = 'A'.charCodeAt(0);
    var upperZ = 'Z'.charCodeAt(0);

    for(let i = lowerA; i <= lowerZ; i++) {
        chars.push(String.fromCharCode(i));
    }

    for(let i = upperA; i <= upperZ; i++) {
        chars.push(String.fromCharCode(i));
    }

    return chars;
}