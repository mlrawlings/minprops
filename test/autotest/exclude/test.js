var Adder = require('.');
var expect = require('chai').expect;

describe('adder', () => {
    it('should add some numbers', () => {
        var adder = new Adder();
        adder.$__add(1);
        expect(adder._).to.equal(1);
    });
});