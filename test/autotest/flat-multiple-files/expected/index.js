"use strict";

var util = require('./util');

module.exports = class Adder {
    constructor() {
        this.__ = 0;
    }
    add(num) {
        this.__ = util.__(this.__, num);
    }
    getSum() {
        return this.__;
    }
};