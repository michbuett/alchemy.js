/*global require*/
var alchemy = require('../js/core/Alchemy.js');
describe('alchemy', function () {
    describe('general utility methods', function () {
        it('can detect numbers', function () {
            expect(alchemy.isNumber(0)).toBeTruthy();
            expect(alchemy.isNumber(42)).toBeTruthy();
            expect(alchemy.isNumber()).toBeFalsy();
            expect(alchemy.isNumber(null)).toBeFalsy();
            expect(alchemy.isNumber('42')).toBeFalsy();
            expect(alchemy.isNumber(true)).toBeFalsy();
            expect(alchemy.isNumber({})).toBeFalsy();
            expect(alchemy.isNumber([])).toBeFalsy();
            expect(alchemy.isNumber(function () {})).toBeFalsy();
        });

        it('can detect strings', function () {
            expect(alchemy.isString('Foo bar baz')).toBeTruthy();
            expect(alchemy.isString('42')).toBeTruthy();
            expect(alchemy.isString(0)).toBeFalsy();
            expect(alchemy.isString(42)).toBeFalsy();
            expect(alchemy.isString()).toBeFalsy();
            expect(alchemy.isString(null)).toBeFalsy();
            expect(alchemy.isString(true)).toBeFalsy();
            expect(alchemy.isString({})).toBeFalsy();
            expect(alchemy.isString([])).toBeFalsy();
            expect(alchemy.isString(function () {})).toBeFalsy();
        });

        it('can detect functions', function () {
            expect(alchemy.isFunction(function () {})).toBeTruthy();
            expect(alchemy.isFunction('Foo bar baz')).toBeFalsy();
            expect(alchemy.isFunction(0)).toBeFalsy();
            expect(alchemy.isFunction()).toBeFalsy();
            expect(alchemy.isFunction(null)).toBeFalsy();
            expect(alchemy.isFunction(true)).toBeFalsy();
            expect(alchemy.isFunction({})).toBeFalsy();
            expect(alchemy.isFunction([])).toBeFalsy();
        });

        it('can detect objects', function () {
            expect(alchemy.isObject({})).toBeTruthy();
            expect(alchemy.isObject(function () {})).toBeFalsy();
            expect(alchemy.isObject([])).toBeFalsy();
            expect(alchemy.isObject(true)).toBeFalsy();
            expect(alchemy.isObject('Foo bar baz')).toBeFalsy();
            expect(alchemy.isObject(0)).toBeFalsy();
            expect(alchemy.isObject()).toBeFalsy();
            expect(alchemy.isObject(null)).toBeFalsy();
        });

        it('can detect arrays', function () {
            expect(alchemy.isArray([])).toBeTruthy();
            expect(alchemy.isArray(function () {})).toBeFalsy();
            expect(alchemy.isArray('Foo bar baz')).toBeFalsy();
            expect(alchemy.isArray(0)).toBeFalsy();
            expect(alchemy.isArray()).toBeFalsy();
            expect(alchemy.isArray(null)).toBeFalsy();
            expect(alchemy.isArray(true)).toBeFalsy();
            expect(alchemy.isArray({})).toBeFalsy();
        });
    });
});

