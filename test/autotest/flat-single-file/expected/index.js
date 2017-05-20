"use strict";

module.exports = class Adder {
    constructor() {
        this.__ = 0;
    }
    add(num) {
        this.__ += num;
    }
    getSum() {
        return this.__;
    }
};