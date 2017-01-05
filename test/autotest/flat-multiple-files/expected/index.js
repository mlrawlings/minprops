"use strict";

var util = require('./util');

module.exports = class Adder {
    constructor() {
        this._ = 0;
    }
    add(num) {
        this._ = util._(this._, num);
    }
    getSum() {
        return this._;
    }
};