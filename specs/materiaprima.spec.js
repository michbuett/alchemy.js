describe('MateriaPrima', function () {
    'use strict';

    var alchemy = require('./../lib/core/Alchemy.js');
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
            var ctor = jasmine.createSpy('constructor');
            mp.constructor = ctor;
            // execute
            i = mp.brew(cfg);
            // verify
            expect(ctor).toHaveBeenCalledWith(cfg);
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
                overrides: {
                    publics: ['constructor'],
                    constructor: jasmine.createSpy(),
                }
            });
            var mp = alchemy.brew({
                ingredients: {
                    test: {
                        potion: ingr,
                        delegate: true,
                    }
                }
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
                overrides: {
                    publics: ['constructor'],
                    constructor: jasmine.createSpy(),
                }
            });
            var mp = alchemy.brew({
                ingredients: {
                    test: {
                        potion: ingr,
                        delegate: true,
                    }
                }
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
                overrides: {
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
            mp.addIngredient('test', {
                publics: ['foo', 'bar'],
                potion: this.ingredient
            });
            // verify
            expect(mp.foo).toBe('foo');
            expect(mp.bar()).toBe('bar');
        });

        it('allows adding simple ingredients by just passing the ingredient', function () {
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
            mp.addIngredient('test', {
                publics: ['foo', 'bar'],
                potion: this.ingredient
            });
            // verify
            expect(mp.meta('ingredients').test.potion).toBe(this.ingredient);
            expect(mp.meta('ingredients').test.delegate).toBeFalsy();
        });

        it('is chainable', function () {
            // prepare
            // expect
            var result = mp.addIngredient('test', 'test.Ingredient');
            // verify
            expect(result).toBe(mp);
        });

        /** @name TEST_addIngerdient_init */
        describe('init', function () {
            it('initializes new ingredients by default (call "init" for simple ones)', function () {
                // prepare
                var ingr = {
                    init: jasmine.createSpy('ingredient.init')
                };
                // execute
                mp.addIngredient('test', ingr);
                // verify
                expect(ingr.init).toHaveBeenCalled();
                expect(ingr.init.mostRecentCall.object).toBe(mp);
            });

            it('initializes new ingredients by default (call "constructor" for delegates)', function () {
                // prepare
                var ingr = alchemy.brew({
                    overrides: {
                        constructor: jasmine.createSpy('delegateIngr.constructor')
                    }
                });
                // execute
                mp.addIngredient('test', {
                    potion: ingr,
                    delegate: true
                });
                // verify
                expect(ingr.constructor).toHaveBeenCalled();
            });

            it('allows to suppress initializing the ingredient', function () {
                // prepare
                var ingr1 = {
                    init: jasmine.createSpy('ingredient.init')
                };
                var ingr2 = alchemy.brew({
                    overrides: {
                        constructor: jasmine.createSpy('delegateIngr.constructor')
                    }
                });
                // execute
                mp.addIngredient('test1', {
                    init: false,
                    potion: ingr1,
                    delegate: false
                });
                mp.addIngredient('test2', {
                    init: false,
                    potion: ingr2,
                    delegate: true
                });
                // verify
                expect(ingr1.init).not.toHaveBeenCalled();
                expect(ingr2.constructor).not.toHaveBeenCalled();
            });
        });

        /** @name TEST_addIngerdient_publics */
        describe('publics', function () {
            it('allows to define the mixed in methods/properies when adding the ingredient', function () {
                // prepare
                var ingr = {
                    foo: function () {},
                    bar: function () {},
                };
                // execute
                mp.addIngredient('test', {
                    potion: ingr,
                    publics: ['foo']
                });
                // verify
                expect(typeof mp.foo).toBe('function');
                expect(typeof mp.bar).toBe('undefined');
            });

            it('allows to define the mixed in methods/properies when defining the ingredient', function () {
                // prepare
                var ingr = {
                    publics: ['foo'],
                    foo: function () {},
                    bar: function () {},
                };
                // execute
                mp.addIngredient('test', {
                    potion: ingr,
                });
                // verify
                expect(typeof mp.foo).toBe('function');
                expect(typeof mp.bar).toBe('undefined');
            });

            it('allows to add every own method/property of the ingredient when omitting "publics"', function () {
                // prepare
                var ingr = Object.create({
                    foo: function () {},
                });
                ingr.bar = function () {};
                ingr.baz = function () {};
                // execute
                mp.addIngredient('test', {
                    potion: ingr,
                });
                // verify
                expect(typeof mp.foo).toBe('undefined');
                expect(typeof mp.bar).toBe('function');
                expect(typeof mp.baz).toBe('function');
            });
        });

        /** @name TEST_addIngerdient_delegate */
        describe('delegate', function () {
            it('allows a simple mix-in of an ingredient into to current potion by default', function () {
                // prepare
                // execute
                mp.addIngredient('test', {
                    potion: this.ingredient
                });
                // verify
                expect(mp.foo).toBe(this.ingredient.foo);
                expect(mp.bar).toBe(this.ingredient.bar);
            });

            it('allows an advanced delegate mix-in by demand', function () {
                // prepare
                // execute
                mp.addIngredient('test', {
                    potion: this.ingredient,
                    delegate: true,
                });
                // verify
                expect(mp.bar).not.toBe(this.ingredient.bar);
                expect(mp.bar()).toBe(this.ingredient.bar());
            });
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

        it('disposes ingredient delegates', function () {
            // prepare
            var i1 = alchemy.brew({
                overrides: {
                    publics: [],
                    dispose: jasmine.createSpy('dispose1')
                }
            });
            var i2 = alchemy.brew({
                overrides: {
                    publics: [],
                    dispose: jasmine.createSpy('dispose2')
                }
            });
            mp.addIngredient('i1', {
                potion: i1,
                delegate: true,
            });
            mp.addIngredient('i2', {
                potion: i2,
                delegate: true
            });
            // execute
            mp.dispose();
            // verify
            expect(i1.dispose).toHaveBeenCalled();
            expect(i2.dispose).toHaveBeenCalled();
        });
    });
});
