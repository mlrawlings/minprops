"use strict";

module.exports = class Adder {
    constructor() {
        this.$__sum = 0;
    }
    add(num) {
        this.$__sum += num;
    }
    getSum() {
        return this.$__sum;
    }
}