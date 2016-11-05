describe('alchemy.lib.Mutator', function () {
    'use strict';

    var mutator = require('./../../lib/Mutator');

    it('allows to create mutations', function () {
        // execute
        var mutation = mutator.mutate({});

        // verify
        expect(typeof mutation).toBe('object');
        expect(typeof mutation.set).toBe('function');
        expect(typeof mutation.apply).toBe('function');
    });

    it('allows to set values', function () {
        // prepare
        var data = { foo: { bar: { baz: 'baz' }}};
        var mutation = mutator.mutate(data);

        // execute
        mutation.set(['foo', 'bar', 'baz'], 'baz2');

        // verify
        expect(data).toEqual({ foo: { bar: { baz: 'baz' }}});
        expect(mutation.apply()).toEqual({ foo: { bar: { baz: 'baz2' }}});
    });

    it('support string paths to set values', function () {
        // prepare
        var data = { foo: { bar: { baz: 'baz' }}};
        var mutation = mutator.mutate(data);

        // execute
        mutation.set('foo.bar.baz', 'baz2');

        // verify
        expect(data).toEqual({ foo: { bar: { baz: 'baz' }}});
        expect(mutation.apply()).toEqual({ foo: { bar: { baz: 'baz2' }}});
    });

    it('allows to chain value setting', function () {
        // prepare
        var data = { foo: { bar: { baz: 'baz' }}};
        var mutation = mutator.mutate(data);

        // execute
        var result = mutation.set(['foo', 'bar', 'baz'], 'baz2');

        // verify
        expect(result).toBe(mutation);
    });


    it('allows to set multiple values at once', function () {
        // prepare
        var data = { foo: { bar: { baz: 'baz' }}};
        var mutation = mutator.mutate(data);

        // execute
        var result = mutation.extend(['foo', 'bar', 'baz'], 'baz2');

        // verify
        expect(result).toBe(mutation);
    });

    it('allows to add an item to a set', function () {
        // prepare
        var data = { foo: { bar: { baz: 'baz' }}};
        var mutation = mutator.mutate(data);

        // execute
        var result = mutation.insert(['foo', 'bar', 'baz'], 'baz2');

        // verify
        expect(result).toBe(mutation);
    });

    it('allows to remove an item from a set', function () {
        // prepare
        var data = { foo: { bar: { baz: 'baz' }}};
        var mutation = mutator.mutate(data);

        // execute
        var result = mutation.remove(['foo', 'bar', 'baz'], 'baz2');

        // verify
        expect(result).toBe(mutation);
    });

    it('allows combine two mutations', function () {
        // prepare
        var data = { foo: 'foo', bar: 'bar'};
        var mutation1 = mutator.mutate(data).set('foo', 'foo2');
        var mutation2 = mutator.mutate(data).set('bar', 'bar2');

        // execute
        var result = mutation1.combine(mutation2);

        // verify
        expect(result).toBe(mutation1);
        expect(result.apply()).toEqual({ foo: 'foo2', bar: 'bar2'});
    });
});
