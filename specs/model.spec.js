describe('alchemy.core.Model', function () {
    'use strict';

    var alchemy = require('../../alchemy.js');

    beforeEach(function () {
        this.model = alchemy('alchemy.core.Model').brew({
            data: {
                foo: 'bar',
                ping: 'pong'
            }
        });
    });

    afterEach(function () {
        if (this.model) {
            this.model.dispose();
            this.model = null;
        }
    });

    describe('get', function () {
        it('allows to get stored attribute values', function () {
            expect(this.model.get('foo')).toBe('bar');
            expect(this.model.get('ping')).toBe('pong');
            expect(this.model.get('baz')).not.toBeDefined();
        });

        it('allows to get all stored attribute values when key is omitted', function () {
            expect(this.model.get()).toEqual({
                foo: 'bar',
                ping: 'pong'
            });
        });
    });

    describe('set', function () {
        it('allows to set attributs one by one', function () {
            // prepare
            // execute
            this.model.set('foo', 'baz');
            // verify
            expect(this.model.get()).toEqual({
                foo: 'baz',
                ping: 'pong'
            });
        });

        it('allows a batch set of attributs', function () {
            // prepare
            // execute
            this.model.set({
                foo: 'baz',
                boom: 'bang'
            });
            // verify
            expect(this.model.get()).toEqual({
                foo: 'baz',
                boom: 'bang',
                ping: 'pong'
            });
        });

        it('fires the "change" event if a value has changed', function () {
            // prepare
            var handler1 = jasmine.createSpy();
            var handler2 = jasmine.createSpy();
            var handler3 = jasmine.createSpy();
            this.model.on('change.foo', handler1);
            this.model.on('change.ping', handler2);
            this.model.on('change', handler3);

            // execute
            this.model.set('foo', 'baz');

            // verify
            expect(handler1).toHaveBeenCalled();
            expect(handler1.mostRecentCall.args[0].oldVal).toBe('bar');
            expect(handler1.mostRecentCall.args[0].newVal).toBe('baz');
            expect(handler1.mostRecentCall.args[0].model).toBe(this.model);

            expect(handler2).not.toHaveBeenCalled();

            expect(handler3).toHaveBeenCalled();
            expect(handler3.mostRecentCall.args[0].model).toBe(this.model);
        });

        it('fires no "change" event if a value was set but did not changed', function () {
            // prepare
            var handler1 = jasmine.createSpy();
            var handler2 = jasmine.createSpy();
            this.model.on('change.foo', handler1);
            this.model.on('change', handler2);

            // execute
            this.model.set('foo', 'bar');

            // verify
            expect(handler1).not.toHaveBeenCalled();
            expect(handler2).not.toHaveBeenCalled();
        });
    });
});
