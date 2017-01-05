"use strict";

module.exports = class Adder {
    constructor() {
        this._ = 0;
    }
    $__add(num) {
        this._ += num;
    }
};