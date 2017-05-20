'use strict';
const escapeStringRegexp = require('escape-string-regexp');
const EMPTY_OBJECT = Object.freeze({});

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

const chars = getChars();

function indexArray(array) {
    if (array) {
        var index = {};
        array.forEach(item => {
            index[item] = true;
        });
        return index;
    } else {
        return EMPTY_OBJECT;
    }
}

function createRegex(prefix) {
    prefix = prefix || '$__';
    return new RegExp('^' + escapeStringRegexp(prefix)+'([\\w]+)');
}


class Minifier {
    constructor(options) {
        this.currentIndex = 0;
        this.props = {};
        this.exclude = indexArray(options.exclude);
        this.match = createRegex(options.matchPrefix);
        this.prefix = options.prefix || '';
        this.suffix = options.suffix || '_';
    }

    isMatch(name) {
        return this.match.test(name);
    }

    getShortProp(name) {
        var shortProp = this.props[name];

        if (!shortProp) {
            do {
                shortProp = this.prefix + this.calcShortProp(this.currentIndex++);
            } while(this.exclude[shortProp]);

            this.props[name] = shortProp;
        }

        return shortProp;
    }

    calcShortProp(index) {
        var prop = chars[index % chars.length];
        while(index >= chars.length) {
            index = Math.floor(index/chars.length)-1;
            prop = chars[index % chars.length] + prop;
        }
        return this.prefix + prop + this.suffix;
    }
}

module.exports = Minifier;