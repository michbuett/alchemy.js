describe('Handling of immutable data', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');
    var immutatio = alchemy('alchemy.core.Immutatio');

    function expectImmutable(subject) {
        expect(typeof subject).toBe('object');
        expect(typeof subject.val).toBe('function');
        expect(typeof subject.set).toBe('function');
        expect(typeof subject.sub).toBe('function');
    }

    /** @name TEST_Immutatio */
    describe('Immutatio', function () {
        describe('makeImmutable', function () {
            it('can create immutable data from raw js objects', function () {
                expectImmutable(immutatio.makeImmutable({
                    foo: 'foo'
                }));
            });

            it('can create immutable data from raw js arrays', function () {
                expectImmutable(immutatio.makeImmutable([1, 2, 3]));

            });

            it('can create immutable data from any other input', function () {
                expectImmutable(immutatio.makeImmutable(1));
                expectImmutable(immutatio.makeImmutable('foo'));
                expectImmutable(immutatio.makeImmutable(function () {}));
            });

            it('returns the input when passing an immutable', function () {
                var immutable = immutatio.makeImmutable('foo');
                var result = immutatio.makeImmutable(immutable);
                expect(result).toBe(immutable);
            });
        });

        describe('find', function () {
            it('allows you to find any sub value', function () {
                var data = immutatio.makeImmutable({
                    foo: [{
                        ping: 'ping-1',
                        pong: 'pong-1',
                    }, {
                        ping: 'ping-2',
                        pong: 'pong-2',
                    }],

                    bar: {
                        ping: 'ping-bar',
                        pong: 'pong-bar'
                    }
                });

                expect(immutatio.find(data, 'foo.0.ping').val()).toBe('ping-1');
                expect(immutatio.find(data, 'foo.0.pong').val()).toBe('pong-1');
                expect(immutatio.find(data, 'foo.1.ping').val()).toBe('ping-2');
                expect(immutatio.find(data, 'foo.1.pong').val()).toBe('pong-2');
                expect(immutatio.find(data, 'bar.ping').val()).toBe('ping-bar');
                expect(immutatio.find(data, 'bar.pong').val()).toBe('pong-bar');
            });

            it('returns null if no immutable was given', function () {
                expect(immutatio.find()).toBe(null);
            });

            it('returns null if no value was found', function () {
                var data = immutatio.makeImmutable('foo');
                expect(immutatio.find(data, 'bar')).toBe(null);
            });

            it('returns the initial immutable if no valid selector is given', function () {
                var data = immutatio.makeImmutable('foo');
                expect(immutatio.find(data, false)).toBe(data);
                expect(immutatio.find(data, null)).toBe(data);
                expect(immutatio.find(data)).toBe(data);
            });
        });
    });

    /** @name TEST_Value */
    describe('Immutable value', function () {
        var testData = [1, 'foo', function f1() {}];
        var changeData = [2, 'bar', function f2() {}];

        describe('val', function () {
            it('can return the stored value', function () {
                testData.forEach(function (item) {
                    expect(immutatio.makeImmutable(item).val()).toBe(item);
                });
            });

            it('can return the value of computed properties', function () {
                var value = immutatio.makeImmutable('foo', {
                    size: function (val) {
                        return val.length;
                    }
                });

                expect(value.val('size')).toBe(3);
            });

            it('returns "null" for any sub-keys', function () {
                testData.forEach(function (item) {
                    expect(immutatio.makeImmutable(item).val('foo')).toBe(null);
                });
            });
        });

        describe('sub', function () {
            it('has no sub values', function () {
                testData.forEach(function (item) {
                    expect(immutatio.makeImmutable(item).sub()).toBeFalsy();
                });
            });
        });

        describe('set', function () {
            it('does not change the immutable', function () {
                testData.forEach(function (orgData, index) {
                    // prepare
                    var newData = changeData[index];
                    var value1 = immutatio.makeImmutable(orgData);

                    // execute
                    var value2 = value1.set(orgData);
                    var value3 = value1.set(newData);

                    // verify
                    expect(value1).toBe(value2);
                    expect(value1).not.toBe(value3);
                    expect(value1.val()).toBe(orgData);
                    expect(value2.val()).toBe(orgData);
                    expect(value3.val()).toBe(newData);
                });
            });

            it('allows to changes the value into a list', function () {
                // prepare
                var struct = immutatio.makeImmutable(testData);

                // execute
                var list = struct.set(['foo']);

                // verify
                expect(list.val()).toEqual(['foo']);
                expect(list.sub(0).val()).toBe('foo');
            });

            it('allows to changes the value into a key-value-store', function () {
                // prepare
                var list = immutatio.makeImmutable(testData);

                // execute
                var struct = list.set({foo: 'foo'});

                // verify
                expect(struct.val()).toEqual({foo: 'foo'});
                expect(struct.sub('foo').val()).toBe('foo');
            });

            it('handles immutable input correctly', function () {
                // prepare
                var immutable1 = immutatio.makeImmutable('foo');
                var immutable2 = immutatio.makeImmutable('bar');

                // execute
                var immutable3 = immutable1.set(immutable1);
                var immutable4 = immutable1.set(immutable2);

                // verify
                expect(immutable3).toBe(immutable1);
                expect(immutable4).toBe(immutable2);
            });
        });
    });

    /** @name TEST_Struct */
    describe('Immutable object', function () {
        var testData = {
            foo: {
                foo: 'foo_1',
                bar: 'bar_1',
            },
            bar: {
                foo: 'foo_2',
                bar: 'bar_2',
            }
        };

        describe('val', function () {
            it('can return the stored value', function () {
                // prepare
                var struct = immutatio.makeImmutable(testData);

                // execute
                var value = struct.val();

                // verify
                expect(value).toEqual(testData);
            });

            it('can return the value of a sub', function () {
                var struct = immutatio.makeImmutable(testData);

                expect(struct.val('foo')).toEqual(testData.foo);
                expect(struct.val('bar')).toEqual(testData.bar);
            });

            it('can return the value of computed properties', function () {
                var struct = immutatio.makeImmutable(testData, {
                    size: function (val) {
                        return Object.keys(val).length;
                    }
                });

                expect(struct.val('size')).toBe(2);
            });

            it('returns "null" for any unknown sub-keys', function () {
                var struct = immutatio.makeImmutable(testData);
                expect(struct.val('baz')).toBe(null);
            });
        });

        describe('sub', function () {
            it('allows to access sub values', function () {
                // prepare
                var struct = immutatio.makeImmutable(testData);

                // execute
                var sub1 = struct.sub('foo');
                var sub2 = struct.sub('bar');
                var sub3 = sub1.sub('bar');
                var sub4 = sub3.sub('bar');

                // verify
                expectImmutable(sub1);
                expectImmutable(sub2);
                expectImmutable(sub3);
                expect(sub4).toBeFalsy();
            });
        });

        describe('set', function () {
            it('allows to add keys', function () {
                // prepare
                var struct = immutatio.makeImmutable(testData);

                // execute
                var struct2 = struct.set('baz', 'baz_1');

                // verify
                expect(struct2.val()).toEqual(alchemy.mix({}, testData, {
                    baz: 'baz_1'
                }));
            });

            it('does not change the immutable', function () {
                // prepare
                var struct = immutatio.makeImmutable(testData);
                var newData = {
                    foo: 'baz'
                };
                var expectedResult = {
                    foo: 'baz',
                    bar: {
                        foo: 'foo_2',
                        bar: 'bar_2',
                    }
                };

                // execute
                var struct2 = struct.set(newData);
                var struct3 = struct.set('foo', 'baz');

                // verify
                expect(struct).not.toBe(struct2);
                expect(struct).not.toBe(struct3);
                expect(struct.val()).toEqual(testData);
                expect(struct2.val()).toEqual(expectedResult);
                expect(struct3.val()).toEqual(expectedResult);
                expect(struct.sub('bar')).toBe(struct2.sub('bar'));
                expect(struct.sub('bar')).toBe(struct3.sub('bar'));
            });


            it('does not create a new immutable if the data was unchanged', function () {
                // prepare
                var struct = immutatio.makeImmutable(testData);
                var sub = struct.sub('foo');

                // execute
                var struct2 = struct.set({
                    foo: {
                        foo: 'foo_1',
                        bar: 'bar_1',
                    },
                    bar: {
                        foo: 'foo_2',
                        bar: 'bar_2',
                    }
                });
                var sub2 = sub.set('foo', 'foo_1');

                // verify
                expect(struct).toBe(struct2);
                expect(sub).toBe(sub2);
            });

            it('allows to changes the struct into a simple value', function () {
                // prepare
                var struct = immutatio.makeImmutable(testData);

                // execute
                var val = struct.set('foo');

                // verify
                expect(val.val()).toBe('foo');
                expect(val.sub(0)).toBeFalsy();
            });

            it('allows to changes the struct into a list', function () {
                // prepare
                var struct = immutatio.makeImmutable(testData);

                // execute
                var list = struct.set(['foo']);

                // verify
                expect(list.val()).toEqual(['foo']);
                expect(list.sub(0).val()).toBe('foo');
            });

            it('handles immutable input correctly', function () {
                // prepare
                var immutable1 = immutatio.makeImmutable({foo: 'bar'});
                var immutable2 = immutatio.makeImmutable('bar');

                // execute
                var immutable3 = immutable1.set(immutable1);
                var immutable4 = immutable1.set(immutable2);

                // verify
                expect(immutable3).toBe(immutable1);
                expect(immutable4).toBe(immutable2);
            });

            it('returns itself if now values is passed', function () {
                var struct = immutatio.makeImmutable({foo: 'bar'});
                expect(struct.set()).toBe(struct);
            });
        });

        describe('each', function () {
            it('allows to change the value of each sub', function () {
                // prepare
                var struct1 = immutatio.makeImmutable({foo: 1, bar: 2, baz: 3});

                // execute
                var struct2 = struct1.each(function (sub) {
                    return 2 * sub.val();
                });

                // verify
                expect(struct1.val()).toEqual({foo: 1, bar: 2, baz: 3});
                expect(struct2.val()).toEqual({foo: 2, bar: 4, baz: 6});
            });
        });
    });

    /** @name TEST_List */
    describe('Immutable array', function () {
        var testData = ['foo', 'bar', 'baz'];

        describe('val', function () {
            it('can return the stored value', function () {
                // prepare
                var list = immutatio.makeImmutable(testData);

                // execute
                var value = list.val();

                // verify
                expect(value).toEqual(testData);
            });

            it('can return the value of a sub', function () {
                var list = immutatio.makeImmutable(testData);

                expect(list.val(0)).toBe('foo');
                expect(list.val(1)).toBe('bar');
                expect(list.val(2)).toBe('baz');
            });

            it('can return the value of computed properties', function () {
                var list = immutatio.makeImmutable(testData, {
                    size: function (val) {
                        return val.length;
                    }
                });

                expect(list.val('size')).toBe(testData.length);
            });

            it('returns "null" for any unknown sub-keys', function () {
                var list = immutatio.makeImmutable(testData);
                expect(list.val(42)).toBe(null);
            });
        });

        describe('sub', function () {
            it('allows to access sub values', function () {
                // prepare
                var list = immutatio.makeImmutable(testData);

                // execute
                var sub1 = list.sub(0);
                var sub2 = list.sub(1);
                var sub3 = list.sub(2);
                var sub4 = list.sub(3);

                // verify
                expectImmutable(sub1);
                expectImmutable(sub2);
                expectImmutable(sub3);
                expect(sub4).toBeFalsy();
            });
        });

        describe('set', function () {
            it('does not change the immutable', function () {
                // prepare
                var list = immutatio.makeImmutable(testData);
                var newData = ['newfoo', 'newbar', 'newbaz'];

                // execute
                var list2 = list.set(newData);
                var list3 = list.set(1, newData[1]);

                // verify
                expect(list).not.toBe(list2);
                expect(list.val()).toEqual(testData);
                expect(list2.val()).toEqual(newData);
                expect(list3.val()).toEqual([testData[0], newData[1], testData[2]]);

                expect(list.sub(0)).toBe(list3.sub(0));
                expect(list.sub(2)).toBe(list3.sub(2));
            });

            it('does not create a new immutable if the data was unchanged', function () {
                // prepare
                var list = immutatio.makeImmutable(testData);

                // execute
                var list2 = list.set([testData[0], testData[1], testData[2]]);
                var list3 = list.set(1, testData[1]);

                // verify
                expect(list).toBe(list2);
                expect(list).toBe(list3);
            });

            it('ignores invalid (<0 or non-numeric) keys', function () {
                // prepare
                var list = immutatio.makeImmutable(testData);

                // execute
                var list2 = list.set('foo', 'ping');
                var list3 = list.set(-1, 'pong');

                // verify
                expect(list).toBe(list2);
                expect(list).toBe(list3);
            });

            it('allows to changes the list into a simple value', function () {
                // prepare
                var list = immutatio.makeImmutable(testData);

                // execute
                var val = list.set('foo');

                // verify
                expect(val.val()).toBe('foo');
                expect(val.sub(0)).toBeFalsy();
            });

            it('allows to changes the list into a key-value-store', function () {
                // prepare
                var list = immutatio.makeImmutable(testData);

                // execute
                var struct = list.set({foo: 'foo'});

                // verify
                expect(struct.val()).toEqual({foo: 'foo'});
                expect(struct.sub('foo').val()).toBe('foo');
            });

            it('handles immutable input correctly', function () {
                // prepare
                var immutable1 = immutatio.makeImmutable([1, 2, 3]);
                var immutable2 = immutatio.makeImmutable('bar');

                // execute
                var immutable3 = immutable1.set(immutable1);
                var immutable4 = immutable1.set(immutable2);

                // verify
                expect(immutable3).toBe(immutable1);
                expect(immutable4).toBe(immutable2);
            });

            it('returns itself if now values is passed', function () {
                var list = immutatio.makeImmutable(['foo', 'bar']);
                expect(list.set()).toBe(list);
            });
        });

        describe('each', function () {
            it('allows to change the value of each sub', function () {
                // prepare
                var list1 = immutatio.makeImmutable([1, 2, 3]);

                // execute
                var list2 = list1.each(function (num) {
                    return 2 * num.val();
                });

                // verify
                expect(list1.val()).toEqual([1, 2, 3]);
                expect(list2.val()).toEqual([2, 4, 6]);
            });

            it('allows to filter subs', function () {
                // prepare
                var list1 = immutatio.makeImmutable([1, 2, 3, 4]);

                // execute
                var list2 = list1.each(function (num) {
                    if (num.val() % 2) {
                        return num;
                    }
                });

                // verify
                expect(list1.val()).toEqual([1, 2, 3, 4]);
                expect(list2.val()).toEqual([1, 3]);
            });
        });
    });
});
