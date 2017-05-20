"use strict";

var util = require('./util');

module.exports = class Adder {
    constructor() {
        this.__ = 0;
    }
    add(num) {
        this.__ = util.__(this.__, num);
    }
    a_() {
        return this.__;
    }
};