describe('Immutatio', function () {
    'use strict';

    var alchemy = require('./../../lib/core/Alchemy.js');

    beforeEach(function () {
    });

    afterEach(function () {
    });

    /** @name TEST_get_set */
    describe('get and set', function () {
        it('allows to get the stored data by name', function () {
            var immutatio = alchemy('alchemy.core.Immutatio').brew({
                foo: 'foo',
                bar: 'bar',
                baz: 'baz',
            });

            expect(immutatio.get('foo')).toBe('foo');
            expect(immutatio.get('bar')).toBe('bar');
            expect(immutatio.get('baz')).toBe('baz');
        });

        it('allows to get the all stored data', function () {
            var immutatio = alchemy('alchemy.core.Immutatio').brew({
                foo: 'foo',
                bar: 'bar',
                baz: 'baz',
            });

            expect(immutatio.get()).toEqual({
                foo: 'foo',
                bar: 'bar',
                baz: 'baz',
            });
        });

        it('allows to modify data without modifications', function () {
            // prepare
            var immutatio = alchemy('alchemy.core.Immutatio').brew({
                foo: 'bar'
            });
            // execute
            var result1 = immutatio.set('foo', 'bar');
            var result2 = immutatio.set('foo', 'baz');
            // verify
            expect(immutatio.get('foo')).toBe('bar');
            expect(result1.get('foo')).toBe('bar');
            expect(result2.get('foo')).toBe('baz');
            expect(result1).toBe(immutatio);
            expect(result2).not.toBe(immutatio);
        });

        it('allows batch updates', function () {
            // prepare
            var immutatio = alchemy('alchemy.core.Immutatio').brew({
                foo: 'bar',
                ping: 'pong'
            });
            // execute
            var result1 = immutatio.set({
                foo: 'bar',
                ping: 'pong'
            });
            var result2 = immutatio.set({
                foo: 'baz',
                ping: 'pang'
            });
            // verify
            expect(immutatio.get('foo')).toBe('bar');
            expect(immutatio.get('ping')).toBe('pong');
            expect(result1.get('foo')).toBe('bar');
            expect(result1.get('ping')).toBe('pong');
            expect(result2.get('foo')).toBe('baz');
            expect(result2.get('ping')).toBe('pang');
            expect(result1).toBe(immutatio);
            expect(result2).not.toBe(immutatio);
        });

        it('allows to update nested data', function () {
            // prepare
            var immutatio = alchemy('alchemy.core.Immutatio').brew({
                foo: 'bar',
                bar: {
                    foo: 1,
                    bar: 2,
                }
            });

            // execute
            var result1 = immutatio.set({
                foo: 'bar',
                bar: {
                    foo: 1,
                    bar: 2,
                }
            });
            var result2 = immutatio.set({
                foo: 'baz',
                bar: {
                    foo: 1,
                    bar: 3,
                }
            });

            // verify
            expect(immutatio.get()).toEqual({
                foo: 'bar',
                bar: {
                    foo: 1,
                    bar: 2,
                }
            });
            expect(result1.get()).toEqual({
                foo: 'bar',
                bar: {
                    foo: 1,
                    bar: 2,
                }
            });
            expect(result2.get()).toEqual({
                foo: 'baz',
                bar: {
                    foo: 1,
                    bar: 3,
                }
            });
            expect(result1).toBe(immutatio);
            expect(result2).not.toBe(immutatio);
        });
    });
});
