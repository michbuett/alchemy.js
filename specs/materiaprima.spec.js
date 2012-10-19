describe('MateriaPrima', function () {
    'use strict';

    var alchemy = require('../lib/core/Alchemy.js'),
        mp;

    beforeEach(function () {
        mp = alchemy('core.MateriaPrima').create();
    });

    afterEach(function () {
        mp.dispose();
        mp = null;
    });

    describe('Meta attributes', function () {
        it('can return meta attributes of a prototype', function () {
            expect(mp.getMetaAttr('name')).toBe('core.MateriaPrima');
        });

        it('can set meta attributes', function () {
            var dummy = {};
            mp.setMetaAttr('dummy', dummy);
            expect(mp.getMetaAttr('dummy')).toBe(dummy);
        });

        it('does not pollute the objects namespace', function () {
            mp.setMetaAttr('foo', 'bar');
            expect(mp.foo).not.toBeDefined();
        });
    });

    describe('creating instances', function () {
        it('can create instances over instances', function () {
            var i1 = mp.create(),
                i2 = i1.create();

            expect(mp.isPrototypeOf(i1)).toBeTruthy();
            expect(i1.getMetaAttr('basetype')).toBe(mp);
            expect(i1.isPrototypeOf(i2)).toBeTruthy();
            expect(i2.getMetaAttr('basetype')).toBe(i1);
        });

        it('calls the constructor and the init method', function () {
            // prepare
            var arg0 = {},
                arg1 = {},
                arg2 = {},
                call, i;
            spyOn(mp, 'constructor').andCallThrough();
            spyOn(mp, 'init');
            // execute
            i = mp.create(arg0, arg1, arg2);
            call = i.constructor.mostRecentCall;
            // verify
            expect(i.constructor).toHaveBeenCalled();
            expect(call.args[0]).toBe(arg0);
            expect(call.args[1]).toBe(arg1);
            expect(call.args[2]).toBe(arg2);
            expect(i.init).toHaveBeenCalled();
        });

        it('applies the config properties in the default constructor', function () {
            // prepare
            var i,
                foo = {},
                bar = {};
            // execute
            i = mp.create({
                foo: foo,
                bar: bar
            });
            // verify
            expect(i.foo).toBe(foo);
            expect(i.bar).toBe(bar);
        });
    });

    describe('adding and overriding methods', function () {
    });
});
