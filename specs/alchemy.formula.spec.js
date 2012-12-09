describe('alchemy.formula', function () {
    'use strict';

    var alchemy = require('../../alchemy.js');
    var formula = alchemy.formula;

    it('allows to get the formulas of the core module', function () {
        expect(formula.get('MateriaPrima')).toBeDefined();
        expect(formula.get('Ingredient')).toBeDefined();
        expect(formula.get('Oculus')).toBeDefined();
    });

    it('allows to store new formulas', function () {
        // prepare
        var f = {name: 'foo'};
        // execute
        formula.add(f);
        // verify
        expect(formula.get('foo')).toBe(f);
    });

    it('overrides an existing formula when adding a new one with the same name', function () {
        // prepare
        var f1 = {name: 'foo', foo: 'bar'};
        var f2 = {name: 'foo', foo: 'baz'};
        formula.add(f1);
        expect(formula.get('foo')).toBe(f1);
        // execute
        formula.add(f2);
        // verify
        expect(formula.get('foo')).toBe(f2);
    });

    it('throws an exception when trying to get an unknown formula', function () {
        expect(function () {
            formula.get('PhilosophersStone');
        }).toThrow('Cannot load formula: PhilosophersStone');
    });

    it('throws an exception when trying to add invalid formulas', function () {
        expect(function () {
            formula.add();
        }).toThrow('Invalid formula: undefined');
        expect(function () {
            formula.add(null);
        }).toThrow('Invalid formula: null');
        expect(function () {
            formula.add('foo');
        }).toThrow('Invalid formula: foo');
    });

    it('throws an exception when trying to add invalid formulas', function () {
        expect(function () {
            formula.add({foo: 'bar'});
        }).toThrow('Missing required property "name"');
    });
});