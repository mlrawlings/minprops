"use strict";

var util = require('./util');

module.exports = class Adder {
    constructor() {
        this.$__sum = 0;
    }
    add(num) {
        this.$__sum = util.$__sum(this.$__sum, num);
    }
    $__getSum() {
        return this.$__sum;
    }
};