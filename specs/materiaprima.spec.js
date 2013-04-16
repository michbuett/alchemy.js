describe('MateriaPrima', function () {
    'use strict';

    var alchemy = require('../../alchemy.js'),
        mp;

    beforeEach(function () {
        mp = alchemy('alchemy.core.MateriaPrima').brew();
    });

    afterEach(function () {
        mp.dispose();
        mp = null;
    });

    describe('Meta attributes', function () {
        it('can return meta attributes of a prototype', function () {
            expect(mp.meta('name')).toBe('alchemy.core.MateriaPrima');
            expect(mp.meta('alias')).toBe('MateriaPrima');
        });

        it('can set meta attributes', function () {
            var dummy = {};
            mp.meta('dummy', dummy);
            expect(mp.meta('dummy')).toBe(dummy);
        });

        it('does not pollute the objects namespace', function () {
            mp.meta('foo', 'bar');
            expect(mp.foo).not.toBeDefined();
        });
    });

    describe('brew', function () {
        it('can create instances over instances', function () {
            var i1 = mp.brew(),
                i2 = i1.brew();

            expect(mp.isPrototypeOf(i1)).toBeTruthy();
            expect(i1.meta('basetype')).toBe(mp);
            expect(i1.isPrototypeOf(i2)).toBeTruthy();
            expect(i2.meta('basetype')).toBe(i1);
        });

        it('calls the constructor', function () {
            // prepare
            var arg0 = {},
                arg1 = {},
                arg2 = {},
                call, i;

            spyOn(mp, 'constructor');
            // execute
            i = mp.brew(arg0, arg1, arg2);
            // verify
            call = i.constructor.mostRecentCall;
            expect(i.constructor).toHaveBeenCalled();
            expect(call.args[0]).toBe(arg0);
            expect(call.args[1]).toBe(arg1);
            expect(call.args[2]).toBe(arg2);
        });

        it('allows the default constructor to call the the init method', function () {
            // prepare
            var i;
            spyOn(mp, 'init');
            // execute
            i = mp.brew();
            // verify
            expect(i.init).toHaveBeenCalled();
        });

        it('applies the config properties in the default constructor', function () {
            // prepare
            var i,
                foo = {},
                bar = {};
            // execute
            i = mp.brew({
                foo: foo,
                bar: bar
            });
            // verify
            expect(i.foo).toBe(foo);
            expect(i.bar).toBe(bar);
        });
    });

    describe('addIngredient', function () {
        beforeEach(function () {
            this.ingredient = alchemy.brew({
                name: 'test.Ingredient',
                extend: 'alchemy.core.Ingredient',
                overrides: {
                    publics: ['foo', 'bar'],
                    foo: 'foo',
                    bar: function () {
                        return 'bar';
                    }
                }
            });
        });

        afterEach(function () {
            this.ingredient.dispose();
            this.ingredient = null;
        });

        it('allows to add new ingredients any time', function () {
            // prepare
            expect(mp.foo).not.toBeDefined();
            expect(mp.bar).not.toBeDefined();
            // expect
            mp.addIngredient('test', this.ingredient);
            // verify
            expect(mp.foo).toBe('foo');
            expect(mp.bar()).toBe('bar');
        });

        it('allows to add new ingredients by their names', function () {
            // prepare
            expect(mp.foo).not.toBeDefined();
            expect(mp.bar).not.toBeDefined();
            // expect
            mp.addIngredient('test', 'test.Ingredient');
            // verify
            expect(mp.foo).toBe('foo');
            expect(mp.bar()).toBe('bar');
        });

        it('stores the ingredients as meta informations', function () {
            // prepare
            // expect
            mp.addIngredient('test', this.ingredient);
            // verify
            expect(mp.meta('ingredients').test).toBe(this.ingredient);
        });
    });
});
