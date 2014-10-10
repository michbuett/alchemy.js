describe('alchemy.formula', function () {
    'use strict';

    var alchemy = require('./../lib/core/Alchemy.js');
    var formula = alchemy.formula;

    it('allows to get the formulas of the core module', function () {
        expect(formula.get('alchemy.core.MateriaPrima')).toBeDefined();
        expect(formula.get('alchemy.core.Oculus')).toBeDefined();
        expect(formula.get('alchemy.core.Observari')).toBeDefined();
        expect(formula.get('alchemy.core.Modelum')).toBeDefined();
        expect(formula.get('alchemy.core.Collectum')).toBeDefined();
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

    it('can determine the unresolve dependencies', function () {
        formula.add({
            name: 'Formula',
            extend: 'BaseFormula',
            requires: [
                'RequiredFomula1',
                'RequiredFomula2'
            ],
            ingredients: {
                ingr1: 'Ingredient1',
                ingr2: {
                    potion: 'Ingredient2'
                }
            }
        });
        var unresolve = formula.dependencies();
        expect(unresolve).toEqual(['BaseFormula', 'RequiredFomula1', 'RequiredFomula2', 'Ingredient1', 'Ingredient2']);
    });
});
