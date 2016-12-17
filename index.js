var path = require('path');
var getRootPackage = require('lasso-package-root').getRootPackage;
var escapeStringRegexp = require('escape-string-regexp');
var chars = getChars();
var contexts = {};

module.exports = minprops;

function minprops(source, filename) {
    var package = getRootPackage(path.dirname(filename));
    var context = getPackageContext(package);
    return replaceProps(source, context);
}

function replaceProps(source, context) {
    return source.replace(context.match, (str, prop) => {
        return getShortProp(prop, context);
    });
}

function getPackageContext(package) {
    if(contexts[package.__filename]) return contexts[package.__filename];

    return contexts[package.__filename] = {
        currentIndex: 0,
        props: {},
        exclude: indexArray(package.minprops && package.minprops.exclude),
        match: createRegex(package.minprops && package.minprops.match),
        prefix: package.minprops && package.minprops.prefix || '',
    };
}

function indexArray(array) {
    var index = {};

    array && array.forEach(item => {
        index[item] = true;
    });

    return index;
}

function createRegex(prefix) {
    prefix = prefix || '$__';
    return new RegExp(escapeStringRegexp(prefix)+'([$\\w]+)', 'g');
}

function getShortProp(name, context) {
    if(context.props[name]) return context.props[name];

    var shortProp;

    do {
        shortProp = context.prefix + calcShortProp(context.currentIndex++);
    } while(context.exclude[shortProp]);

    return context.props[name] = shortProp;
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

    for(var i = lowerA; i <= lowerZ; i++) {
        chars.push(String.fromCharCode(i));
    }

    for(var i = upperA; i <= upperZ; i++) {
        chars.push(String.fromCharCode(i));
    }

    return chars;
}