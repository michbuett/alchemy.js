/*global require*/
describe('alchemy', function () {
    var alchemy = require('../js/core/Alchemy.js');

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

    describe('Prototype definituion', function () {
        afterEach(function () {
            alchemy.potions = {};
        });

        it('can return registered prototypes', function () {
            // prepare
            var testProto = {
                foo: 'bar'
            };
            alchemy.potions.test = testProto;
            // execute/verify
            expect(alchemy('test')).toBe(testProto);
        });

        it('can load formulas', function () {
            // prepare
            alchemy.formulas = {};
            alchemy.potions = {};
            // execute
            var mp = alchemy('core.MateriaPrima');
            // verify
            expect(mp).toBeDefined();
            expect(typeof mp.create).toBe('function');
            expect(typeof mp.init).toBe('function');
        });

        it('can brew poitions (based on materia prima)', function () {
            var potion = alchemy.brew({
                name: 'dummy',
                overrides: {
                    foo: function () {
                        return 'foo';
                    }
                }
            });
            expect(potion.getMetaAttr('name')).toBe('dummy');
            expect(potion.getMetaAttr('supertype')).toBe(alchemy('core.MateriaPrima'));
            expect(alchemy('core.MateriaPrima').isPrototypeOf(potion)).toBeTruthy();
            expect(potion.foo()).toBe('foo');
        });

        it('can extend any other potion', function () {
            var potion1 = alchemy.brew({
                overrides: {
                    foo: function () {
                        return 'foo';
                    }
                }
            });
            var potion2 = alchemy.brew({
                extend: potion1,
                overrides: {
                    bar: function () {
                        return 'bar';
                    }
                }
            });
            expect(potion2.getMetaAttr('supertype')).toBe(potion1);
            expect(potion1.isPrototypeOf(potion2)).toBeTruthy();
            expect(potion2.foo()).toBe('foo');
            expect(potion2.bar()).toBe('bar');
        });

        it('can override methods of super types', function () {
            var potion1 = alchemy.brew({
                overrides: {
                    foo: function () {
                        return 'foo';
                    }
                }
            });
            var potion2 = alchemy.brew({
                extend: potion1,
                overrides: {
                    foo: function () {
                        return _super.call(this) + ' - bar';
                    }
                }
            });
            var potion3 = alchemy.brew({
                extend: potion2,
                overrides: {
                    foo: function () {
                        return _super.call(this) + ' - baz';
                    }
                }
            });
            expect(potion1.foo()).toBe('foo');
            expect(potion2.foo()).toBe('foo - bar');
            expect(potion3.foo()).toBe('foo - bar - baz');
        });
    });
});

