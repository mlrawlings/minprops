"use strict";

module.exports = class Adder {
    constructor() {
        this._ = 0;
    }
    a(num) {
        this._ += num;
    }
};