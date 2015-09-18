describe('MateriaPrima', function () {
    'use strict';

    var MateriaPrima = require('../../../lib/core/MateriaPrima');
    var mp;

    beforeEach(function () {
        mp = MateriaPrima.brew();
    });

    afterEach(function () {
        mp.dispose();
    });

    /** @name TEST_meta */
    describe('Meta attributes', function () {
        it('can set and get meta attributes', function () {
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

        it('allows the default constructor to call the the init method', function () {
            // prepare
            var i;
            spyOn(mp, 'init');
            // execute
            i = mp.brew();
            // verify
            expect(i.init).toHaveBeenCalled();
        });
    });
});
