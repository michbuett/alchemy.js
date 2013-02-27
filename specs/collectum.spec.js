
describe('alchemy.core.Model', function () {
    'use strict';

    var alchemy = require('../../alchemy.js');
    var Collectum = alchemy('alchemy.core.Collectum');
    var data1 = {
        id: 'id-1',
        foo: 'foo'
    };
    var data2 = {
        id: 'id-2',
        bar: 'bar'
    };
    var data3 = {
        id: 'id-3',
        baz: 'baz'
    };


    beforeEach(function () {
        this.collectum = Collectum.brew({
            items: [data1, data2, data3]
        });
    });

    afterEach(function () {
        if (this.collectum) {
            this.collectum.dispose();
            this.collectum = null;
        }
    });

    describe('constructor', function () {
        it('allows to add items using the constructor', function () {
            this.collectum = Collectum.brew();
            expect(this.collectum.length).toBe(0);

            this.collectum = Collectum.brew({
                items: [data1, data2, data3]
            });
            expect(this.collectum.length).toBe(3);
        });
    });

    describe('contains', function () {
        it('allows to determine if an item is already in the collection', function () {
            expect(this.collectum.contains(data1)).toBeTruthy();
            expect(this.collectum.contains(data2)).toBeTruthy();
            expect(this.collectum.contains(data3)).toBeTruthy();
            expect(this.collectum.contains()).toBeFalsy();
            expect(this.collectum.contains({id: 'foo'})).toBeFalsy();
        });
    });

    describe('at', function () {
        it('allows to get a stored object by its index', function () {
            expect(this.collectum.at(0)).toBe(data1);
            expect(this.collectum.at(1)).toBe(data2);
            expect(this.collectum.at(2)).toBe(data3);
            expect(this.collectum.at()).not.toBeDefined();
            expect(this.collectum.at(-1)).not.toBeDefined();
            expect(this.collectum.at(42)).not.toBeDefined();
        });
    });

    describe('get', function () {
        it('allows to get a stored object by its id', function () {
            expect(this.collectum.get(data1.id)).toBe(data1);
            expect(this.collectum.get(data2.id)).toBe(data2);
            expect(this.collectum.get(data3.id)).toBe(data3);
            expect(this.collectum.get('some-none-existing-id')).not.toBeDefined();
        });
    });

    describe('toData', function () {
        it('allows get ALL the data', function () {
            expect(this.collectum.toData()).toEqual([{
                id: 'id-1',
                foo: 'foo'
            }, {
                id: 'id-2',
                bar: 'bar'
            }, {
                id: 'id-3',
                baz: 'baz'
            }]);
        });
    });

    describe('indexOf', function () {
        it('allows to determine the index of an item by the item\'s id', function () {
            expect(this.collectum.indexOf(data1.id)).toBe(0);
            expect(this.collectum.indexOf(data2.id)).toBe(1);
            expect(this.collectum.indexOf(data3.id)).toBe(2);
            expect(this.collectum.indexOf('some-none-existing-id')).toBe(-1);
            expect(this.collectum.indexOf()).toBe(-1);
        });

        it('allows to determine the index of an item by the item itself', function () {
            expect(this.collectum.indexOf(data1)).toBe(0);
            expect(this.collectum.indexOf(data2)).toBe(1);
            expect(this.collectum.indexOf(data3)).toBe(2);
            expect(this.collectum.indexOf({})).toBe(-1);
            expect(this.collectum.indexOf()).toBe(-1);
        });
    });

    describe('add', function () {
        it('allows to add an new item at the end', function () {
            // prepare
            var newItem = {
                id: 'new',
            };
            // execute
            this.collectum.add(newItem);
            // verify
            expect(this.collectum.length).toBe(4);
            expect(this.collectum.indexOf(newItem)).toBe(3);
            expect(this.collectum.get('new')).toBe(newItem);
        });

        it('allows to add multiple items at the end', function () {
            // prepare
            var newItem1 = {
                id: 'new1',
            };
            var newItem2 = {
                id: 'new2',
            };
            var newItem3 = {
                id: 'new3',
            };
            // execute
            this.collectum.add([newItem1, newItem2, newItem3]);
            // verify
            expect(this.collectum.length).toBe(6);
            expect(this.collectum.indexOf(newItem1)).toBe(3);
            expect(this.collectum.indexOf(newItem2)).toBe(4);
            expect(this.collectum.indexOf(newItem3)).toBe(5);
            expect(this.collectum.get('new1')).toBe(newItem1);
            expect(this.collectum.get('new2')).toBe(newItem2);
            expect(this.collectum.get('new3')).toBe(newItem3);
        });

        it('prevents adding the same object twice', function () {
            // prepare
            var newItem = {
                id: 'new',
            };
            // execute
            this.collectum.add(newItem);
            this.collectum.add(newItem);
            this.collectum.add(newItem);
            this.collectum.add(newItem);
            // verify
            expect(this.collectum.length).toBe(4);
        });
    });

    describe('insert', function () {
        it('allows to insert an new item at the given position', function () {
        });
    });

    describe('remove', function () {
    });
});
