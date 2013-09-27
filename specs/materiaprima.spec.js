describe('MateriaPrima', function () {
    'use strict';

    var alchemy = require('../../alchemy.js');
    var mp;

    beforeEach(function () {
        mp = alchemy('alchemy.core.MateriaPrima').brew();
    });

    afterEach(function () {
        mp.dispose();
    });

    /** @name TEST_meta */
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

    /** @name TEST_brew */
    describe('brew', function () {
        it('can create instances over instances', function () {
            var i1 = mp.brew(),
                i2 = i1.brew();

            expect(mp.isPrototypeOf(i1)).toBeTruthy();
            expect(i1.meta('prototype')).toBe(mp);
            expect(i1.isPrototypeOf(i2)).toBeTruthy();
            expect(i2.meta('prototype')).toBe(i1);
        });

        it('calls the constructor', function () {
            // prepare
            var cfg = {};
            var i;
            spyOn(mp, 'constructor');
            // execute
            i = mp.brew(cfg);
            // verify
            expect(i.constructor).toHaveBeenCalledWith(cfg);
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

        it('initializes the ingredients with the given config', function () {
            // prepare
            var ingr = alchemy.brew({
                extend: 'alchemy.core.Ingredient',
                overrides: {
                    publics: [],
                    constructor: jasmine.createSpy(),
                }
            });
            var mp = alchemy.brew({
                ingredients: [{
                    key: 'test',
                    ptype: ingr
                }]
            });
            var cfg = {};
            // execute
            mp.brew(cfg);
            // verify
            expect(ingr.constructor).toHaveBeenCalledWith(cfg);
        });

        it('initializes the ingredients with a conflict free config', function () {
            // prepare
            var ingr = alchemy.brew({
                extend: 'alchemy.core.Ingredient',
                overrides: {
                    publics: [],
                    constructor: jasmine.createSpy(),
                }
            });
            var mp = alchemy.brew({
                ingredients: [{
                    key: 'test',
                    ptype: ingr
                }]
            });
            var testConfig = {};
            var cfg = {
                test: testConfig
            };
            // execute
            mp.brew(cfg);
            // verify
            expect(ingr.constructor).toHaveBeenCalledWith(testConfig);
        });
    });

    /** @name TEST_addIngerdient */
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

    /** @name TEST_dispose */
    describe('dispose', function () {
        it('removes references of the meta properties', function () {
            // prepare
            var ingredients = {};
            mp.meta('ingredients', ingredients);
            expect(mp.meta('prototype')).toBe(alchemy('MateriaPrima'));
            expect(mp.meta('ingredients')).toBe(ingredients);
            // execute
            mp.dispose();
            // verify
            expect(mp.meta('prototype')).toBe(null);
            expect(mp.meta('ingredients')).toBe(null);
        });

        it('cleans all ingredients', function () {
            // prepare
            var i1 = alchemy.brew({
                extend: 'alchemy.core.Ingredient',
                overrides: {
                    publics: [],
                    dispose: jasmine.createSpy('dispose1')
                }
            });
            var i2 = alchemy.brew({
                extend: 'alchemy.core.Ingredient',
                overrides: {
                    publics: [],
                    dispose: jasmine.createSpy('dispose2')
                }
            });
            mp.addIngredient('i1', i1);
            mp.addIngredient('i2', i2);
            // execute
            mp.dispose();
            // verify
            expect(i1.dispose).toHaveBeenCalled();
            expect(i2.dispose).toHaveBeenCalled();
        });
    });
});
