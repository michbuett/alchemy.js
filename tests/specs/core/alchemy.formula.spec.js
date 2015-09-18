describe('alchemy.formula', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');
    var formula;

    beforeEach(function () {
        formula = new alchemy.FormulaModule();
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
                },
                ingr3: {
                    fooBar: 'Ingredient3'
                },
                ingr4: null,
            }
        });

        var unresolve = formula.dependencies();

        expect(unresolve).toEqual([
            'BaseFormula',
            'RequiredFomula1',
            'RequiredFomula2',
            'Ingredient1',
            'Ingredient2'
        ]);
    });

    it('supports api v2', function () {
        // prepare
        var Oculus = require('../../../lib/core/Oculus');
        var Observari = require('../../../lib/core/Observari');
        var source = {
            foo: 'foo',
            bar: 'bar',
        };

        var spy = jasmine.createSpy().andReturn(source);

        // execute
        alchemy.formula.define('formula-v2', [
            'alchemy.core.Oculus',
            'alchemy.core.Observari',
        ], spy);

        // verify
        var potion = alchemy('formula-v2');
        expect(potion.foo).toBe('foo');
        expect(potion.bar).toBe('bar');
        expect(spy).toHaveBeenCalledWith(Oculus, Observari);
    });
});
