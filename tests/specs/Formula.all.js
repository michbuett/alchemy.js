describe('alchemy.lib.Formula', function () {
    'use strict';

    var formula = require('./../../lib/Formula');

    it('can create brew-able potions', function () {
        // prepare
        var base = {};

        // execute
        var f = formula(base);

        // verify
        expect(typeof f).toBe('object');
        expect(typeof f.brew).toBe('function');
    });

    it('throws an error when creating a formula from non object', function () {
        expect(function () { formula(null); }).toThrow('Base hast be an object, "null" given');
        expect(function () { formula(); }).toThrow('Base hast be an object, "undefined" given');
        expect(function () { formula(1); }).toThrow('Base hast be an object, "1" given');
        expect(function () { formula('foo'); }).toThrow('Base hast be an object, "foo" given');
    });

    describe('brew', function () {
        var base = {};
        var f = formula(base);

        it('preserves the prototype chain', function () {
            // prepare
            // execute
            var obj = f.brew();

            // verify
            expect(base.isPrototypeOf(obj)).toBeTruthy();
        });

        it('allows to override instance properties', function () {
            // prepare
            // execute
            var obj = f.brew({
                foo: 'foo',
                bar: 'bar',
                baz: 'baz',
            });

            // verify
            expect(obj.foo).toBe('foo');
            expect(obj.bar).toBe('bar');
            expect(obj.baz).toBe('baz');
        });

        it('allows to pass arguments to the original constructor if neccessary', function () {
            // prepare
            var ctor = jasmine.createSpy();
            var f = formula({
                constructor: ctor,
            });

            // execute
            f.brew(null, ['arg1', 'arg2', 'arg3']);

            // verfiy
            expect(ctor).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
        });

        it('allows to pass a function which is called with the prototype', function () {
            // prepare
            var base = {
                foo: function () {
                    return 'foo';
                },
            };

            // execute
            var sub = formula(base).brew(function (_super) {
                return {
                    foo: function () {
                        return _super.foo.call(this) + ' - bar';
                    },
                };
            });

            // verify
            expect(sub.foo()).toBe('foo - bar');
        });
    });

    describe('extend', function () {
        var f = formula({
            foo: 'foo',
            bar: 'bar',
        });

        it('allows to add/override properties and methods', function () {
            // prepare
            // execute
            var obj = f.extend({
                foo: 'foo_sub',
                bar: 'bar_sub',
                baz: 'baz',
            }).brew();

            // verify
            expect(obj.foo).toBe('foo_sub');
            expect(obj.bar).toBe('bar_sub');
            expect(obj.baz).toBe('baz');
        });

        it('preserves the prototype chain', function () {
            // prepare
            var base = {};

            // execute
            var sub = formula(base).extend().extend().extend().brew();

            // verify
            expect(base.isPrototypeOf(sub)).toBeTruthy();
        });

        it('does not modify the extended potion formula', function () {
            var sub = f.extend({
                baz: 'baz',
            });

            // verify
            expect(sub).not.toBe(f);
            expect(f.brew().baz).toBe(undefined);
            expect(sub.brew().baz).toBe('baz');
        });

        it('allows to pass a function which is called with the extendee', function () {
            // prepare
            var base = {
                foo: function () {
                    return 'foo';
                },
            };

            // execute
            var sub = formula(base).extend(function (_super) {
                return {
                    foo: function () {
                        return _super.foo.call(this) + ' - bar';
                    },
                };
            }).extend(function (_super) {
                return {
                    foo: function () {
                        return _super.foo.call(this) + ' - baz';
                    },
                };
            }).brew();

            // verify
            expect(sub.foo()).toBe('foo - bar - baz');
        });
    });

    describe('whenBrewed', function () {
        it('allows register one or more callbacks on brewing', function () {
            // prepare
            var onInitSpy1 = jasmine.createSpy('onInit1');
            var onInitSpy2 = jasmine.createSpy('onInit2');

            // execute
            formula({})
                .whenBrewed(onInitSpy1)
                .whenBrewed(onInitSpy2)
                .brew();

            // verify
            expect(onInitSpy1).toHaveBeenCalled();
            expect(onInitSpy2).toHaveBeenCalled();
        });

        it('exectutes the the callback in the currect context', function () {
            // prepare
            var onInitSpy = jasmine.createSpy('onInit');

            // execute
            var potion = formula({}).whenBrewed(onInitSpy).brew();

            // verify
            expect(onInitSpy.calls.mostRecent().object).toBe(potion);
        });

        it('executes the callbacks in the correct order', function () {
            // prepare
            var test = [];

            // execute
            formula({
                constructor: function () {
                    test.push('foo');
                }
            }).whenBrewed(function () {
                test.push('bar');
            }).whenBrewed(function () {
                test.push('baz');
            }).brew();

            // verify
            expect(test.join(' ')).toBe('foo bar baz');
        });

        it('preserves the prototype chain', function () {
            // prepare
            var base = {};

            // execute
            var sub = formula(base).whenBrewed(function () {
                this.foo = 'bar';
            }).brew();

            // verify
            expect(base.isPrototypeOf(sub)).toBeTruthy();
            expect(sub.foo).toBe('bar');
        });
    });

    describe('dispose', function () {
        it('brewed potions can be disposed', function () {
            var potion = formula({}).brew();

            expect(typeof potion.dispose).toBe('function');

            expect(function () {
                potion.dispose();
            }).not.toThrow();
        });

        it('clears object references', function () {
            // prepare
            var potion = formula({
                foo: {},
                text: 'some text'
            }).extend({
                bar: []
            }).extend({
                baz: {},
            }).brew({
                ping: {},
                pong: []
            });

            // execute
            potion.dispose();

            // verify
            expect(potion.foo).toBeFalsy();
            expect(potion.bar).toBeFalsy();
            expect(potion.baz).toBeFalsy();
            expect(potion.ping).toBeFalsy();
            expect(potion.pong).toBeFalsy();
            expect(potion.text).toBe('some text');
        });

        it('also disposes children', function () {
            // prepare
            var dispose1 = jasmine.createSpy('dispose spy #1');
            var dispose2 = jasmine.createSpy('dispose spy #2');
            var potion = formula({
                foo: {
                    dispose: dispose1,
                },
            }).brew({
                bar: {
                    dispose: dispose2,
                },
            });

            // execute
            potion.dispose();

            // verify
            expect(potion.foo).toBeFalsy();
            expect(potion.bar).toBeFalsy();
            expect(dispose1).toHaveBeenCalled();
            expect(dispose2).not.toHaveBeenCalled();
        });

        it('allows register one or more callbacks on disposing', function () {
            // prepare
            var spy1 = jasmine.createSpy('spy1');
            var spy2 = jasmine.createSpy('spy2');

            // execute
            formula({})
                .whenDisposed(spy1)
                .whenDisposed(spy2)
                .brew()
                .dispose();

            // verify
            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
        });
    });
});
