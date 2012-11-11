describe('Ingredient', function () {
    'use strict';
    var alchemy = require('../lib/core/Alchemy.js');
    var testIngredient = alchemy.brew({
        extend: 'Ingredient',
        overrides: {
            publics: ['foo', 'bar'],
            foo: function () {
                return 'foo';
            },
            bar: 'bar'
        }
    });

    it('can be mixed into any potion during brewing', function () {
        // prepare/execute
        var testBase = alchemy.brew({
            ingredients: [{
                key: 'test',
                ptype: testIngredient
            }]
        });
        // verify
        expect(testBase.foo()).toBe('foo');
        expect(testBase.bar).toBe('bar');
    });

    it('can be mixed into any potion at any time', function () {
        // prepare
        var testBase = alchemy('MateriaPrima').create();
        // execute
        testBase.addIngredient('test', testIngredient);
        // verify
        expect(testBase.foo()).toBe('foo');
        expect(testBase.bar).toBe('bar');
    });

    it('allows overriding the ingredient\'s method as any method of a super potion', function () {
        // prepare/execute
        var testBase = alchemy.brew({
            ingredients: [{
                key: 'test',
                ptype: testIngredient
            }],
            overrides: {
                foo: function () {
                    return _super.call(this) + ' - bar';
                }
            }
        });
        // verify
        expect(testBase.foo()).toBe('foo - bar');
    });
});
