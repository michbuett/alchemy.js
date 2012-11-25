describe('MateriaPrima', function () {
    'use strict';

    var alchemy = require('../../alchemy.js'),
        mp;

    beforeEach(function () {
        mp = alchemy('MateriaPrima').create();
    });

    afterEach(function () {
        mp.dispose();
        mp = null;
    });

    describe('Meta attributes', function () {
        it('can return meta attributes of a prototype', function () {
            expect(mp.getMetaAttr('name')).toBe('MateriaPrima');
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

    describe('create', function () {
        it('can create instances over instances', function () {
            var i1 = mp.create(),
                i2 = i1.create();

            expect(mp.isPrototypeOf(i1)).toBeTruthy();
            expect(i1.getMetaAttr('basetype')).toBe(mp);
            expect(i1.isPrototypeOf(i2)).toBeTruthy();
            expect(i2.getMetaAttr('basetype')).toBe(i1);
        });

        it('calls the constructor', function () {
            // prepare
            var arg0 = {},
                arg1 = {},
                arg2 = {},
                call, i;

            spyOn(mp, 'constructor');
            // execute
            i = mp.create(arg0, arg1, arg2);
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
            i = mp.create();
            // verify
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
});
