/*global require*/
var g = require('../js/core/Alchemy.js');
describe('alchemy', function () {
    describe('general utility methods', function () {
        it('can detect numbers', function () {
            expect(g.Alchemy.isNumber(0)).toBeTruthy();
            expect(g.Alchemy.isNumber(42)).toBeTruthy();
            expect(g.Alchemy.isNumber()).toBeFalsy();
            expect(g.Alchemy.isNumber(null)).toBeFalsy();
            expect(g.Alchemy.isNumber('42')).toBeFalsy();
            expect(g.Alchemy.isNumber(true)).toBeFalsy();
            expect(g.Alchemy.isNumber({})).toBeFalsy();
            expect(g.Alchemy.isNumber([])).toBeFalsy();
            expect(g.Alchemy.isNumber(function () {})).toBeFalsy();
        });
    });
});

