describe('alchemy.core.Collectum', function () {
    'use strict';

    var alchemy = require('../../alchemy.js');
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
        this.collectum = alchemy('alchemy.core.Collectum').brew({
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
            this.collectum = alchemy('Collectum').brew();
            expect(this.collectum.length).toBe(0);

            this.collectum = alchemy('Collectum').brew({
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

        it('prevents adding the same object twice with a single command', function () {
            // prepare
            var newItem = {
                id: 'new',
            };
            // execute
            this.collectum.add([newItem, newItem, newItem, newItem]);
            // verify
            expect(this.collectum.length).toBe(4);
        });

        it('can store objects whithout id - but only once', function () {
            // prepare
            var newItem = {
                foo: 'bar',
            };
            expect(this.collectum.length).toBe(3);
            // execute
            this.collectum.add(newItem);
            this.collectum.add(newItem);
            this.collectum.add(newItem);
            this.collectum.add(newItem);
            // verify
            expect(this.collectum.length).toBe(4);
            expect(newItem.id).toBeDefined();
        });

        it('triggers the "add" and the "change" event (once!) when adding items', function () {
            // prepare
            var onAdd = jasmine.createSpy('onAdd');
            var onChange = jasmine.createSpy('onChange');
            this.collectum.on('add', onAdd);
            this.collectum.on('change', onChange);
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
            this.collectum.add([newItem1, newItem2, newItem3, data1, newItem1]);
            // verify
            expect(onAdd).toHaveBeenCalled();
            expect(onAdd.callCount).toBe(1);
            expect(onAdd.mostRecentCall.args[0].added).toEqual([newItem1, newItem2, newItem3]);
            expect(onAdd.mostRecentCall.args[0].insertIndex).toBe(3);
            expect(onChange).toHaveBeenCalled();
            expect(onChange.callCount).toBe(1);
            expect(onChange.mostRecentCall.args[0].added).toEqual([newItem1, newItem2, newItem3]);
            expect(onChange.mostRecentCall.args[0].insertIndex).toBe(3);
        });

        it('triggers no event when adding items silently', function () {
            // prepare
            var onAdd = jasmine.createSpy('onAdd');
            var onChange = jasmine.createSpy('onChange');
            this.collectum.on('add', onAdd);
            this.collectum.on('change', onChange);
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
            this.collectum.add([newItem1, newItem2, newItem3], true);
            // verify
            expect(onAdd).not.toHaveBeenCalled();
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('insert', function () {
        it('allows to insert a new item at the given position', function () {
            // prepare
            var newItem = {
                id: 'new',
            };
            // execute
            this.collectum.insert(1, newItem);
            // verify
            expect(this.collectum.length).toBe(4);
            expect(this.collectum.indexOf(data1)).toBe(0);
            expect(this.collectum.indexOf(newItem)).toBe(1);
            expect(this.collectum.indexOf(data2)).toBe(2);
            expect(this.collectum.indexOf(data3)).toBe(3);
            expect(this.collectum.get('new')).toBe(newItem);
        });

        it('allows to insert multiple items at the given position', function () {
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
            this.collectum.insert(1, [newItem1, newItem2, newItem3]);
            // verify
            expect(this.collectum.length).toBe(6);
            expect(this.collectum.indexOf(data1)).toBe(0);
            expect(this.collectum.indexOf(newItem1)).toBe(1);
            expect(this.collectum.indexOf(newItem2)).toBe(2);
            expect(this.collectum.indexOf(newItem3)).toBe(3);
            expect(this.collectum.indexOf(data2)).toBe(4);
            expect(this.collectum.indexOf(data3)).toBe(5);
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
            this.collectum.insert(1, newItem);
            this.collectum.insert(1, newItem);
            this.collectum.insert(1, newItem);
            this.collectum.insert(1, newItem);
            // verify
            expect(this.collectum.length).toBe(4);
        });

        it('prevents adding the same object twice with a single command', function () {
            // prepare
            var newItem = {
                id: 'new',
            };
            // execute
            this.collectum.insert(1, [newItem, newItem, newItem, newItem]);
            // verify
            expect(this.collectum.length).toBe(4);
        });

        it('can store objects whithout id - but only once', function () {
            // prepare
            var newItem = {
                foo: 'bar',
            };
            expect(this.collectum.length).toBe(3);
            // execute
            this.collectum.insert(1, newItem);
            this.collectum.insert(1, newItem);
            this.collectum.insert(1, newItem);
            this.collectum.insert(1, newItem);
            // verify
            expect(this.collectum.length).toBe(4);
            expect(newItem.id).toBeDefined();
        });

        it('triggers the "add" and the "change" event (once!) when inserting items', function () {
            // prepare
            var onAdd = jasmine.createSpy('onAdd');
            var onChange = jasmine.createSpy('onChange');
            this.collectum.on('add', onAdd);
            this.collectum.on('change', onChange);
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
            this.collectum.insert(1, [newItem1, newItem2, newItem3, data1, newItem1]);
            // verify
            expect(onAdd).toHaveBeenCalled();
            expect(onAdd.callCount).toBe(1);
            expect(onAdd.mostRecentCall.args[0].added).toEqual([newItem1, newItem2, newItem3]);
            expect(onAdd.mostRecentCall.args[0].insertIndex).toBe(1);
            expect(onChange).toHaveBeenCalled();
            expect(onChange.callCount).toBe(1);
            expect(onChange.mostRecentCall.args[0].added).toEqual([newItem1, newItem2, newItem3]);
            expect(onChange.mostRecentCall.args[0].insertIndex).toBe(1);
        });

        it('triggers no event when inserting items silently', function () {
            // prepare
            var onAdd = jasmine.createSpy('onAdd');
            var onChange = jasmine.createSpy('onChange');
            this.collectum.on('add', onAdd);
            this.collectum.on('change', onChange);
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
            this.collectum.insert(1, [newItem1, newItem2, newItem3], true);
            // verify
            expect(onAdd).not.toHaveBeenCalled();
            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('remove and removeAt', function () {
        it('allows to remove an item', function () {
            // prepare
            // execute
            this.collectum.remove(data2);
            // verify
            expect(this.collectum.length).toEqual(2);
            expect(this.collectum.toData()).toEqual([{
                id: 'id-1',
                foo: 'foo'
            }, {
                id: 'id-3',
                baz: 'baz'
            }]);
            expect(this.collectum.contains(data1)).toBeTruthy();
            expect(this.collectum.contains(data2)).toBeFalsy();
            expect(this.collectum.contains(data3)).toBeTruthy();

            expect(this.collectum.indexOf(data1)).toEqual(0);
            expect(this.collectum.indexOf(data2)).toEqual(-1);
            expect(this.collectum.indexOf(data3)).toEqual(1);

            expect(this.collectum.get(data1.id)).toBe(data1);
            expect(this.collectum.get(data2.id)).not.toBeDefined();
            expect(this.collectum.get(data3.id)).toBe(data3);
        });

        it('allows to remove an item by its id', function () {
            // prepare
            // execute
            this.collectum.remove(data2.id);
            // verify
            expect(this.collectum.length).toEqual(2);
            expect(this.collectum.toData()).toEqual([{
                id: 'id-1',
                foo: 'foo'
            }, {
                id: 'id-3',
                baz: 'baz'
            }]);
            expect(this.collectum.contains(data1)).toBeTruthy();
            expect(this.collectum.contains(data2)).toBeFalsy();
            expect(this.collectum.contains(data3)).toBeTruthy();

            expect(this.collectum.indexOf(data1)).toEqual(0);
            expect(this.collectum.indexOf(data2)).toEqual(-1);
            expect(this.collectum.indexOf(data3)).toEqual(1);

            expect(this.collectum.get(data1.id)).toBe(data1);
            expect(this.collectum.get(data2.id)).not.toBeDefined();
            expect(this.collectum.get(data3.id)).toBe(data3);
        });

        it('allows to remove an item by its index', function () {
            // prepare
            // execute
            this.collectum.removeAt(1);
            // verify
            expect(this.collectum.length).toEqual(2);
            expect(this.collectum.toData()).toEqual([{
                id: 'id-1',
                foo: 'foo'
            }, {
                id: 'id-3',
                baz: 'baz'
            }]);
            expect(this.collectum.contains(data1)).toBeTruthy();
            expect(this.collectum.contains(data2)).toBeFalsy();
            expect(this.collectum.contains(data3)).toBeTruthy();

            expect(this.collectum.indexOf(data1)).toEqual(0);
            expect(this.collectum.indexOf(data2)).toEqual(-1);
            expect(this.collectum.indexOf(data3)).toEqual(1);

            expect(this.collectum.get(data1.id)).toBe(data1);
            expect(this.collectum.get(data2.id)).not.toBeDefined();
            expect(this.collectum.get(data3.id)).toBe(data3);
        });

        it('ignores invalid input', function () {
            // prepare
            // execute
            this.collectum.remove();
            this.collectum.remove('bullshit');
            this.collectum.remove({cool: 'Object'});
            // verify
            expect(this.collectum.length).toEqual(3);
        });

        it('triggers the "remove" and the "change" event when removing an item', function () {
            // prepare
            var onRemove = jasmine.createSpy('onRemove');
            var onChange = jasmine.createSpy('onChange');
            this.collectum.on('remove', onRemove);
            this.collectum.on('change', onChange);
            // execute
            this.collectum.remove(data1);
            // verify
            expect(onRemove).toHaveBeenCalled();
            expect(onRemove.mostRecentCall.args[0].removed).toBe(data1);
            expect(onChange).toHaveBeenCalled();
            expect(onChange.mostRecentCall.args[0].removed).toBe(data1);
            expect(onChange.mostRecentCall.args[0].added).not.toBeDefined();
        });

        it('triggers the "remove" and the "change" event when removing an item by its id', function () {
            // prepare
            var onRemove = jasmine.createSpy('onRemove');
            var onChange = jasmine.createSpy('onChange');
            this.collectum.on('remove', onRemove);
            this.collectum.on('change', onChange);
            // execute
            this.collectum.remove(data1.id);
            // verify
            expect(onRemove).toHaveBeenCalled();
            expect(onRemove.mostRecentCall.args[0].removed).toBe(data1);
            expect(onChange).toHaveBeenCalled();
            expect(onChange.mostRecentCall.args[0].removed).toBe(data1);
            expect(onChange.mostRecentCall.args[0].added).not.toBeDefined();
        });

        it('triggers the "remove" and the "change" event when removing an item by its index', function () {
            // prepare
            var onRemove = jasmine.createSpy('onRemove');
            var onChange = jasmine.createSpy('onChange');
            this.collectum.on('remove', onRemove);
            this.collectum.on('change', onChange);
            // execute
            this.collectum.removeAt(0);
            // verify
            expect(onRemove).toHaveBeenCalled();
            expect(onRemove.mostRecentCall.args[0].removed).toBe(data1);
            expect(onChange).toHaveBeenCalled();
            expect(onChange.mostRecentCall.args[0].removed).toBe(data1);
            expect(onChange.mostRecentCall.args[0].added).not.toBeDefined();
        });

        it('triggers no event when removing an item silently', function () {
            // prepare
            var onRemove = jasmine.createSpy('onRemove');
            var onChange = jasmine.createSpy('onChange');
            this.collectum.on('remove', onRemove);
            this.collectum.on('change', onChange);
            // execute
            this.collectum.removeAt(0, true);
            this.collectum.remove(data2, true);
            this.collectum.remove(data3.id, true);
            // verify
            expect(this.collectum.length).toEqual(0);
            expect(onRemove).not.toHaveBeenCalled();
            expect(onChange).not.toHaveBeenCalled();
        });
    });
});
