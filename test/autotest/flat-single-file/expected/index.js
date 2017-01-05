"use strict";

module.exports = class Adder {
    constructor() {
        this._ = 0;
    }
    add(num) {
        this._ += num;
    }
    getSum() {
        return this._;
    }
}