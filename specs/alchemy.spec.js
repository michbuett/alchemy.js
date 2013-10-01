/*global require*/
describe('alchemy', function () {
    'use strict';

    var alchemy = require('../../alchemy.js');

    describe('general utility methods', function () {
        it('can detect numbers', function () {
            expect(alchemy.isNumber(0)).toBeTruthy();
            expect(alchemy.isNumber(42)).toBeTruthy();
            expect(alchemy.isNumber(Number.MIN_VALUE)).toBeTruthy();
            expect(alchemy.isNumber(Number.MAX_VALUE)).toBeTruthy();
            expect(alchemy.isNumber(Number.POSITIVE_INFINITY)).toBeTruthy();
            expect(alchemy.isNumber(Number.NEGATIVE_INFINITY)).toBeTruthy();

            expect(alchemy.isNumber()).toBeFalsy();
            expect(alchemy.isNumber(null)).toBeFalsy();
            expect(alchemy.isNumber('42')).toBeFalsy();
            expect(alchemy.isNumber(true)).toBeFalsy();
            expect(alchemy.isNumber({})).toBeFalsy();
            expect(alchemy.isNumber([])).toBeFalsy();
            expect(alchemy.isNumber(function () {})).toBeFalsy();
            expect(alchemy.isNumber(NaN)).toBeFalsy();
        });

        it('can detect strings', function () {
            expect(alchemy.isString('Foo bar baz')).toBeTruthy();
            expect(alchemy.isString('42')).toBeTruthy();
            expect(alchemy.isString(0)).toBeFalsy();
            expect(alchemy.isString(42)).toBeFalsy();
            expect(alchemy.isString()).toBeFalsy();
            expect(alchemy.isString(null)).toBeFalsy();
            expect(alchemy.isString(true)).toBeFalsy();
            expect(alchemy.isString({})).toBeFalsy();
            expect(alchemy.isString([])).toBeFalsy();
            expect(alchemy.isString(function () {})).toBeFalsy();
        });

        it('can detect functions', function () {
            expect(alchemy.isFunction(function () {})).toBeTruthy();
            expect(alchemy.isFunction('Foo bar baz')).toBeFalsy();
            expect(alchemy.isFunction(0)).toBeFalsy();
            expect(alchemy.isFunction()).toBeFalsy();
            expect(alchemy.isFunction(null)).toBeFalsy();
            expect(alchemy.isFunction(true)).toBeFalsy();
            expect(alchemy.isFunction({})).toBeFalsy();
            expect(alchemy.isFunction([])).toBeFalsy();
        });

        it('can detect objects', function () {
            expect(alchemy.isObject({})).toBeTruthy();
            expect(alchemy.isObject(function () {})).toBeFalsy();
            expect(alchemy.isObject([])).toBeFalsy();
            expect(alchemy.isObject(true)).toBeFalsy();
            expect(alchemy.isObject('Foo bar baz')).toBeFalsy();
            expect(alchemy.isObject(0)).toBeFalsy();
            expect(alchemy.isObject()).toBeFalsy();
            expect(alchemy.isObject(null)).toBeFalsy();
        });

        it('can detect arrays', function () {
            expect(alchemy.isArray([])).toBeTruthy();
            expect(alchemy.isArray(function () {})).toBeFalsy();
            expect(alchemy.isArray('Foo bar baz')).toBeFalsy();
            expect(alchemy.isArray(0)).toBeFalsy();
            expect(alchemy.isArray()).toBeFalsy();
            expect(alchemy.isArray(null)).toBeFalsy();
            expect(alchemy.isArray(true)).toBeFalsy();
            expect(alchemy.isArray({})).toBeFalsy();
        });

        it('can detect boolean values', function () {
            expect(alchemy.isBoolean(true)).toBeTruthy();
            expect(alchemy.isBoolean(false)).toBeTruthy();

            expect(alchemy.isBoolean(0)).toBeFalsy();
            expect(alchemy.isBoolean(42)).toBeFalsy();
            expect(alchemy.isBoolean(Number.MIN_VALUE)).toBeFalsy();
            expect(alchemy.isBoolean(Number.MAX_VALUE)).toBeFalsy();
            expect(alchemy.isBoolean(Number.POSITIVE_INFINITY)).toBeFalsy();
            expect(alchemy.isBoolean(Number.NEGATIVE_INFINITY)).toBeFalsy();
            expect(alchemy.isBoolean('42')).toBeFalsy();
            expect(alchemy.isBoolean({})).toBeFalsy();
            expect(alchemy.isBoolean([])).toBeFalsy();
            expect(alchemy.isBoolean(function () {})).toBeFalsy();
            expect(alchemy.isBoolean()).toBeFalsy();
            expect(alchemy.isBoolean(null)).toBeFalsy();
            expect(alchemy.isBoolean(NaN)).toBeFalsy();
        });
        it('can detect defined values', function () {
            expect(alchemy.isDefined(0)).toBeTruthy();
            expect(alchemy.isDefined(42)).toBeTruthy();
            expect(alchemy.isDefined(Number.MIN_VALUE)).toBeTruthy();
            expect(alchemy.isDefined(Number.MAX_VALUE)).toBeTruthy();
            expect(alchemy.isDefined(Number.POSITIVE_INFINITY)).toBeTruthy();
            expect(alchemy.isDefined(Number.NEGATIVE_INFINITY)).toBeTruthy();
            expect(alchemy.isDefined('42')).toBeTruthy();
            expect(alchemy.isDefined(true)).toBeTruthy();
            expect(alchemy.isDefined({})).toBeTruthy();
            expect(alchemy.isDefined([])).toBeTruthy();
            expect(alchemy.isDefined(function () {})).toBeTruthy();

            expect(alchemy.isDefined()).toBeFalsy();
            expect(alchemy.isDefined(null)).toBeFalsy();
            expect(alchemy.isDefined(NaN)).toBeFalsy();
        });
    });

    describe('render', function () {
        it('can replace data attributes', function () {
            expect(alchemy.render('<div id="<$=data.id$>" class="<$=data.cls$>"><$=data.text$></div>', {
                id: 'test_id',
                cls: 'test_class',
                text: 'test_text'
            })).toBe('<div id="test_id" class="test_class">test_text</div>');
        });

        it('can evaluate loops', function () {
            /*jshint white: false*/
            expect(alchemy.render([
                '<$ for (var i = 0; i < data.list.length; i++) { $>',
                '<li><$=data.list[i]$></li>',
                '<$ } $>'
            ].join(''), {
                list: [1, 2, 3]
            })).toBe('<li>1</li><li>2</li><li>3</li>');
            /*jshint white: true*/
        });

        it('can evaluate conditions', function () {
            /*jshint white: false*/
            var tpl = [
                '<$ if (data.condition) { $>',
                '<div><$=data.trueVal$></div>',
                '<$ } else { $>',
                '<div><$=data.falseVal$></div>',
                '<$ } $>'
            ].join('');
            /*jshint white: true*/

            expect(alchemy.render(tpl, {
                condition: true,
                trueVal: 'YEEEHAA!'
            })).toBe('<div>YEEEHAA!</div>');
            expect(alchemy.render(tpl, {
                condition: false,
                falseVal: 'OH NO!'
            })).toBe('<div>OH NO!</div>');
        });

        it('removes block comments', function () {
            /*jshint white: false*/
            var tpl = [
                '<div>',
                '/*',
                ' * This is a comment',
                ' */',
                'YEEEHAA!/* and another comment*/',
                '</div>'
            ].join('\n');
            /*jshint white: true*/

            expect(alchemy.render(tpl).replace(/\s/g, '')).toBe('<div>YEEEHAA!</div>');
        });

        it('removes line comments', function () {
            /*jshint white: false*/
            var tpl = [
                '<div>',
                '// This is a comment',
                'YEEEHAA! // and another comment',
                '</div>'
            ].join('\n');
            /*jshint white: true*/

            expect(alchemy.render(tpl).replace(/\s/g, '')).toBe('<div>YEEEHAA!</div>');
        });

        it('has no access to the main closure scope', function () {
            expect(alchemy.render('<$=(typeof potions)$>')).toBe('undefined');
        });

        it('has access to the explicitly given closure scope', function () {
            expect(alchemy.render('<$=(typeof alchemy)$>')).toBe('function');
        });
    });

    /** @name TEST_each */
    describe('each', function () {
        var expectedScope = {};
        var actualScope;
        var args = ['foo', 'bar', 'baz'];
        var spy = jasmine.createSpy('iterator').andCallFake(function () {
            actualScope = this;
        });

        beforeEach(function () {
            spy.reset();
        });

        it('allows to iterate through arrays', function () {
            // prepare
            var array = [1, 2, 3, 4, 5];
            // execute
            alchemy.each(array, spy, expectedScope, args);
            // verify
            expect(spy).toHaveBeenCalled();
            expect(spy.callCount).toBe(array.length);
            expect(actualScope).toBe(expectedScope);
            for (var i = 0; i < array.length; i++) {
                var call = spy.calls[i];
                expect(call.args[0]).toBe(array[i]);
                expect(call.args[1]).toBe(i);
                expect(call.args[2]).toBe(args[0]);
                expect(call.args[3]).toBe(args[1]);
                expect(call.args[4]).toBe(args[2]);
            }
        });

        it('allows to iterate through objects', function () {
            // prepare
            var obj = {
                key0: 'value0',
                key1: 'value1',
                key2: 'value2'
            };
            // execute
            alchemy.each(obj, spy, expectedScope, args);
            // verify
            expect(spy).toHaveBeenCalled();
            expect(spy.callCount).toBe(3);
            expect(actualScope).toBe(expectedScope);
            for (var i = 0; i < 3; i++) {
                var call = spy.calls[i];
                var key = 'key' + i;
                var value = 'value' + i;

                expect(call.args[0]).toBe(value);
                expect(call.args[1]).toBe(key);
                expect(call.args[2]).toBe(args[0]);
                expect(call.args[3]).toBe(args[1]);
                expect(call.args[4]).toBe(args[2]);
            }
        });

        it('handles additional arguments correctly', function () {
            alchemy.each([1], spy);
            expect(spy.mostRecentCall.args.length).toBe(2);

            alchemy.each([1], spy, null, 'foo');
            expect(spy.mostRecentCall.args.length).toBe(3);
            expect(spy.mostRecentCall.args[2]).toBe('foo');

            alchemy.each([1], spy, null, ['foo', 'bar', 'baz']);
            expect(spy.mostRecentCall.args.length).toBe(5);
            expect(spy.mostRecentCall.args[2]).toBe('foo');
            expect(spy.mostRecentCall.args[3]).toBe('bar');
            expect(spy.mostRecentCall.args[4]).toBe('baz');
        });

        it('ignores non-iterable inputs', function () {
            alchemy.each([], spy);
            expect(spy).not.toHaveBeenCalled();

            alchemy.each({}, spy);
            expect(spy).not.toHaveBeenCalled();

            alchemy.each(null, spy);
            expect(spy).not.toHaveBeenCalled();

            alchemy.each(undefined, spy);
            expect(spy).not.toHaveBeenCalled();

            alchemy.each(function () {}, spy);
            expect(spy).not.toHaveBeenCalled();

            alchemy.each(42, spy);
            expect(spy).not.toHaveBeenCalled();

            alchemy.each('Super duper mega party', spy);
            expect(spy).not.toHaveBeenCalled();

            alchemy.each(true, spy);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    /** @name TEST_mix */
    describe('mix', function () {
        it('allows to mix multiple objects', function () {
            expect(alchemy.mix({
                foo: 1,
                bar: 2,
                baz: 3
            }, {
                foo: 10,
                bar: 20
            }, {
                foo: 100,
                ping: 'pong'
            }, {
                foo: 1000,
                bar: 2000
            })).toEqual({
                foo: 1000,
                bar: 2000,
                baz: 3,
                ping: 'pong'
            });
        });

        it('ignores unmixable objects', function () {
            expect(alchemy.mix({
                foo: 1,
                bar: 2,
                baz: 3
            }, null, {
                foo: 10,
                bar: 20
            }, 3, 'Hello Dear!', {
                foo: 100,
                ping: 'pong'
            })).toEqual({
                foo: 100,
                bar: 20,
                baz: 3,
                ping: 'pong'
            });
        });
    });


    describe('extract', function () {
        it('reduces an array of objects to an array of object values', function () {
            expect(alchemy.extract([{
                key: 'foo'
            }, {
                key: 'bar'
            }, {
                key: 'baz'
            }, {
                kez: 'bam'
            }], 'key')).toEqual(['foo', 'bar', 'baz', undefined]);
        });

        it('reduces an object of objects to an array of object values', function () {
            expect(alchemy.extract({
                o1: {
                    key: 'foo'
                },
                o2: {
                    key: 'bar'
                },
                o3: {
                    key: 'baz'
                },
                o4: {
                    kez: 'bam'
                }
            }, 'key')).toEqual(['foo', 'bar', 'baz', undefined]);
        });

        it('allway returns an array', function () {
            expect(alchemy.isArray(alchemy.extract())).toBeTruthy();
            expect(alchemy.isArray(alchemy.extract(null, null))).toBeTruthy();
            expect(alchemy.isArray(alchemy.extract([], 'foo'))).toBeTruthy();
            expect(alchemy.isArray(alchemy.extract(null, 'bar'))).toBeTruthy();
        });
    });

    /** @name TEST_union */
    describe('union', function () {
        it('allows to get unique set of values from multiple arrays or objects', function () {
            expect(alchemy.union([1, 2, 4, 10], [3, 4], [1, 2, 5, 101])).toEqual([1, 2, 4, 10, 3, 5, 101]);
            expect(alchemy.union({foo: 'foo'}, {bar: 'bar'}, {bar: 'baz'})).toEqual(['foo', 'bar', 'baz']);
            expect(alchemy.union({foo: 'foo'}, ['foo', 'bar'], {bar: 'baz'})).toEqual(['foo', 'bar', 'baz']);
        });

        it('ignores non-iterable inputs', function () {
            expect(alchemy.union()).toEqual([]);
            expect(alchemy.union([1, 2, 4, 10], null, [1, 2, 5, 101])).toEqual([1, 2, 4, 10, 5, 101]);
            expect(alchemy.union({foo: 'foo'}, {bar: 'bar'})).toEqual(['foo', 'bar']);
            expect(alchemy.union({foo: 'foo'}, null, ['foo', 'bar'], 1, 'two', {bar: 'baz'})).toEqual(['foo', 'bar', 'baz']);
        });
    });

    /** @name TEST_meta */
    describe('meta', function () {
        it('can set meta attributes', function () {
            var obj = {};
            var dummy = {};
            alchemy.meta(obj, 'dummy', dummy);
            expect(alchemy.meta(obj, 'dummy')).toBe(dummy);
        });

        it('does not pollute the objects namespace', function () {
            var obj = {};
            alchemy.meta(obj, 'foo', 'bar');
            expect(obj.foo).not.toBeDefined();
        });
    });

    /** @name TEST_defineProperty */
    describe('defineProperty', function () {
        it('allows you to define new properties which are writable, enumerable and configurable by default', function () {
            // prepare
            var obj = {};
            // execute
            alchemy.defineProperty(obj, 'foo', {value: 'bar'});
            // verify
            expect(obj.foo).toBe('bar');
            expect(Object.getOwnPropertyDescriptor(obj, 'foo')).toEqual({
                value: 'bar',
                writable: true,
                enumerable: true,
                configurable: true
            });
        });

        it('can create read-only properties', function () {
            // prepare
            var obj = {};
            alchemy.defineProperty(obj, 'foo', {
                value: 'bar',
                writable: false
            });
            // execute / verify
            expect(Object.getOwnPropertyDescriptor(obj, 'foo').writable).toBeFalsy();
            expect(function () {
                obj.foo = 'bar';
            }).toThrow();
            expect(obj.foo).toBe('bar');
        });

        it('can create not-enumerable properties', function () {
            // prepare
            var obj = {};
            alchemy.defineProperty(obj, 'foo', {
                value: 'bar',
                enumerable: false
            });
            // execute / verify
            expect(obj.foo).toBe('bar');
            expect(Object.getOwnPropertyDescriptor(obj, 'foo').enumerable).toBeFalsy();
            expect(obj.propertyIsEnumerable('foo')).toBeFalsy();
            expect(Object.keys(obj)).toEqual([]);
        });

        it('can create properties which cannot be redefined', function () {
            // prepare
            var obj = {};
            alchemy.defineProperty(obj, 'foo', {
                value: 'bar',
                configurable: false
            });
            // execute / verify
            expect(obj.foo).toBe('bar');
            expect(Object.getOwnPropertyDescriptor(obj, 'foo').configuration).toBeFalsy();
            expect(function () {
                alchemy.defineProperty(obj, 'foo', {
                    value: 'baz'
                });
            }).toThrow();
        });

        it('allows to define a named getter function', function () {
            // prepare
            var getter = jasmine.createSpy().andCallFake(function () {
                return 'bar';
            });
            var obj = {
                'foo?': getter
            };
            var expectedValue;
            // execute
            alchemy.defineProperty(obj, 'foo', {
                get: 'foo?'
            });
            expectedValue = obj.foo;
            // verify
            expect(getter).toHaveBeenCalled();
            expect(expectedValue).toBe('bar');
        });

        it('allows to define a named getter function using a default name', function () {
            // prepare
            var getter = jasmine.createSpy().andCallFake(function () {
                return 'bar';
            });
            var obj = {
                getFoo: getter
            };
            var expectedValue;
            // execute
            alchemy.defineProperty(obj, 'foo', {get: true});
            expectedValue = obj.foo;
            // verify
            expect(getter).toHaveBeenCalled();
            expect(expectedValue).toBe('bar');
        });

        it('allows to define an anonym getter function', function () {
            // prepare
            var obj = {};
            var getter = jasmine.createSpy().andCallFake(function () {
                return 'bar';
            });
            var expectedValue;
            // execute
            alchemy.defineProperty(obj, 'foo', {get: getter});
            expectedValue = obj.foo;
            // verify
            expect(getter).toHaveBeenCalled();
            expect(expectedValue).toBe('bar');
            expect(Object.keys(obj)).toEqual(['foo']);
        });


        it('allows to override a getter function', function () {
            // prepare
            var obj = {
                getFoo: function () {
                    return 'bar';
                }
            };
            var expectedValue;
            // execute
            alchemy.defineProperty(obj, 'foo', {get: true});
            alchemy.extend(obj, {
                getFoo: alchemy.override(function (_super) {
                    return function () {
                        return 'foo - ' + _super.call(this) + ' - baz';
                    };
                })
            });
            expectedValue = obj.foo;
            // verify
            expect(expectedValue).toBe('foo - bar - baz');
        });

        it('allows to define a named setter function', function () {
            // prepare
            var setter = jasmine.createSpy();
            var obj = {
                'foo!': setter
            };
            // execute
            alchemy.defineProperty(obj, 'foo', {set: 'foo!'});
            obj.foo = 'bar';
            // verify
            expect(setter).toHaveBeenCalledWith('bar');
        });

        it('allows to define a named setter function using a default name', function () {
            // prepare
            var setter = jasmine.createSpy();
            var obj = {
                setFoo: setter
            };
            // execute
            alchemy.defineProperty(obj, 'foo', {set: true});
            obj.foo = 'bar';
            // verify
            expect(setter).toHaveBeenCalledWith('bar');
        });

        it('allows to define an anonym setter function', function () {
            // prepare
            var setter = jasmine.createSpy();
            var obj = {};
            // execute
            alchemy.defineProperty(obj, 'foo', {set: setter});
            obj.foo = 'bar';
            // verify
            expect(setter).toHaveBeenCalledWith('bar');
        });

        it('allows to override a setter function', function () {
            // prepare
            var obj = {
                getFoo: function () {
                    return this._foo;
                },
                setFoo: function (val) {
                    this._foo = val;
                    return this._foo;
                }
            };
            // execute
            alchemy.defineProperty(obj, 'foo', {
                get: true,
                set: true
            });
            alchemy.extend(obj, {
                setFoo: alchemy.override(function (_super) {
                    return function (val) {
                        return _super.call(this, 'foo - ' + val + ' - baz');
                    };
                })
            });
            obj.foo = 'bar';
            // verify
            expect(obj.foo).toBe('foo - bar - baz');
        });

        it('allows to mark an object as a property definition (mode B)', function () {
            var prop = alchemy.defineProperty({});
            expect(alchemy.isObject(prop)).toBeTruthy();
            expect(alchemy.meta(prop, 'isProperty')).toBeTruthy();
        });
    });

    /** @name TEST_extend */
    describe('extend', function () {
        it('allows overriding multiple methods at once', function () {
            // prepare
            var f1 = function () { return 'override-1'; };
            var f2 = function () { return 'override-2'; };
            var f3 = function () { return 'override-3'; };
            var obj = {
                f1: function () { return 'origin-1'; },
                f2: function () { return 'origin-2'; },
                f3: function () { return 'origin-3'; },
                f4: function () { return 'origin-4'; },
            };
            // execute
            alchemy.extend(obj, {
                f1: f1,
                f2: f2,
                f3: f3
            });
            // verify
            expect(obj.f1()).toBe('override-1');
            expect(obj.f2()).toBe('override-2');
            expect(obj.f3()).toBe('override-3');
            expect(obj.f4()).toBe('origin-4');
        });

        it('allows the overrides to access the overidden methods', function () {
            // prepare
            var obj = {
                foo: function () {
                    return 'foo';
                }
            };
            // execute
            alchemy.extend(obj, {
                foo: alchemy.override(function (_super) {
                    return function () {
                        return _super.call(this) + ' - bar';
                    };
                })
            });
            alchemy.extend(obj, {
                foo: alchemy.override(function (_super) {
                    return function () {
                        return _super.call(this) + ' - baz';
                    };
                })
            });
            // verify
            expect(obj.foo()).toBe('foo - bar - baz');
        });

        it('allows overriding constructors', function () {
            // prepare
            var orgCtor = function () {
                this.foo = 'foo';
            };
            var obj = {
                constructor: orgCtor
            };
            var newCtor = alchemy.override(function (_super) {
                return function () {
                    this.bar = 'bar';
                    _super.call(this);
                };
            });
            //execute
            alchemy.extend(obj, {
                constructor: newCtor
            });
            obj.constructor();
            // verify
            expect(obj.foo).toBe('foo');
            expect(obj.bar).toBe('bar');
        });

        it('can add non-function properties too', function () {
            // prepare
            var obj = {
                foo: 'foo',
                bar: 'bar'
            };
            // execute
            obj = alchemy.extend(obj, {
                bar: 'baz',
                ping: 'pong'
            });
            // verify
            expect(obj).toEqual({
                foo: 'foo',
                bar: 'baz',
                ping: 'pong'
            });
        });

        it('allows wrapping methods manually', function () {
            // prepare
            var orgFoo = jasmine.createSpy('original obj.foo');
            var obj = {
                foo: orgFoo
            };
            alchemy.extend(obj, {
                foo: alchemy.override(function (_super) {
                    return function () {
                        _super.call(this);
                    };
                })
            });
            spyOn(obj, 'foo').andCallThrough();
            // execute
            obj.foo();
            // verify
            expect(orgFoo).toHaveBeenCalled();
        });

        it('does not change the closure scope', function () {
            // prepare
            var expectedScopeObj = {};
            var actualScopeObj;
            var obj = {
                foo: function () {}
            };
            // execute
            alchemy.extend(obj, {
                foo: alchemy.override(function () {
                    return function () {
                        actualScopeObj = expectedScopeObj;
                    };
                })
            });
            obj.foo();
            // verify
            expect(actualScopeObj).toBe(expectedScopeObj);
        });

        it('can create properties', function () {
            // prepare
            var obj = {};
            // execute
            alchemy.extend(obj, {
                foo: alchemy.defineProperty({
                    value: 'foo'
                }),
                bar: alchemy.defineProperty({
                    value: 'bar',
                    writable: false,
                    enumerable: false,
                    configurable: false,
                }),
            });
            // verify
            expect(obj.foo).toBe('foo');
            expect(obj.bar).toBe('bar');
            expect(Object.getOwnPropertyDescriptor(obj, 'foo')).toEqual({
                value: 'foo',
                writable: true,
                enumerable: true,
                configurable: true
            });
            expect(Object.getOwnPropertyDescriptor(obj, 'bar')).toEqual({
                value: 'bar',
                writable: false,
                enumerable: false,
                configurable: false
            });
        });

        it('can define getter and setter', function () {
            // prepare
            var obj = {
                getFoo: jasmine.createSpy('getFoo').andReturn('bar'),
                setFoo: jasmine.createSpy('setFoo'),
            };
            // execute
            alchemy.extend(obj, {
                foo: alchemy.defineProperty({
                    get: true,
                    set: true
                }),
            });
            var result = obj.foo;
            obj.foo = 'baz';
            // verify
            expect(result).toBe('bar');
            expect(obj.getFoo).toHaveBeenCalled();
            expect(obj.setFoo).toHaveBeenCalledWith('baz');
        });
    });

    /** @name TEST_brew */
    describe('brew', function () {
        it('can load formulas', function () {
            // prepare
            // execute
            var mp = alchemy('alchemy.core.MateriaPrima');
            // verify
            expect(mp).toBeDefined();
            expect(typeof mp.brew).toBe('function');
            expect(typeof mp.init).toBe('function');
        });

        it('can brew poitions (based on materia prima)', function () {
            var potion = alchemy.brew({
                name: 'dummy',
                overrides: {
                    foo: function () {
                        return 'foo';
                    }
                }
            });
            expect(potion.meta('name')).toBe('dummy');
            expect(potion.meta('supertype')).toBe(alchemy('MateriaPrima'));
            expect(alchemy('MateriaPrima').isPrototypeOf(potion)).toBeTruthy();
            expect(potion.foo()).toBe('foo');
        });

        it('can extend any other potion', function () {
            var potion1 = alchemy.brew({
                overrides: {
                    foo: function () {
                        return 'foo';
                    }
                }
            });
            var potion2 = alchemy.brew({
                extend: potion1,
                overrides: {
                    bar: function () {
                        return 'bar';
                    }
                }
            });
            expect(potion2.meta('supertype')).toBe(potion1);
            expect(potion1.isPrototypeOf(potion2)).toBeTruthy();
            expect(potion2.foo()).toBe('foo');
            expect(potion2.bar()).toBe('bar');
        });

        it('can override methods of super types', function () {
            var potion1 = alchemy.brew({
                overrides: {
                    foo: function () {
                        return 'foo';
                    }
                }
            });
            var potion2 = alchemy.brew({
                extend: potion1,
                overrides: {
                    foo: alchemy.override(function (_super) {
                        return function () {
                            return _super.call(this) + ' - bar';
                        };
                    })
                }
            });
            var potion3 = alchemy.brew({
                extend: potion2,
                overrides: {
                    foo: alchemy.override(function (_super) {
                        return function () {
                            return _super.call(this) + ' - baz';
                        };
                    })
                }
            });
            expect(potion1.foo()).toBe('foo');
            expect(potion2.foo()).toBe('foo - bar');
            expect(potion3.foo()).toBe('foo - bar - baz');
        });

        it('allows to create different potions of the same super types without conflicts', function () {
            var realbase = alchemy.brew({
                overrides: {
                    foo: function () {
                        return 'real base';
                    }
                }
            });
            // first override
            var base = alchemy.brew({
                extend: realbase,
                overrides: {
                    foo: function () {
                        return 'base';
                    }
                }
            });
            // second override (split to 3 different versions)
            var potion1 = alchemy.brew({
                extend: base,
                overrides: {
                    foo: alchemy.override(function (_super) {
                        return function () {
                            return _super.call(this) + ' - foo';
                        };
                    })
                }
            });
            var potion2 = alchemy.brew({
                extend: base,
                overrides: {
                    foo: alchemy.override(function (_super) {
                        return function () {
                            return _super.call(this) + ' - bar';
                        };
                    })
                }
            });
            var potion3 = alchemy.brew({
                extend: base,
                overrides: {
                    foo: alchemy.override(function (_super) {
                        return function () {
                            return _super.call(this) + ' - baz';
                        };
                    })
                }
            });
            // third override (override the different versions to check if there are conflicts)
            var potion2Sub = alchemy.brew({
                extend: potion2,
                overrides: {
                    foo: alchemy.override(function (_super) {
                        return function () {
                            return _super.call(this) + ' - sub';
                        };
                    })
                }
            });
            var potion3Sub = alchemy.brew({
                extend: potion3,
                overrides: {
                    foo: alchemy.override(function (_super) {
                        return function () {
                            return _super.call(this) + ' - sub';
                        };
                    })
                }
            });
            expect(potion1.foo()).toBe('base - foo');
            expect(potion2.foo()).toBe('base - bar');
            expect(potion3.foo()).toBe('base - baz');
            expect(potion2Sub.foo()).toBe('base - bar - sub');
            expect(potion3Sub.foo()).toBe('base - baz - sub');
        });

        it('allows to define attributes with given getter and setter function', function () {
            // prepare
            var potion = alchemy.brew({
                overrides: {
                    foo: alchemy.defineProperty({
                        get: 'getFoo',
                        set: 'setFoo',
                    }),

                    getFoo: jasmine.createSpy('getFoo').andReturn('bar'),
                    setFoo: jasmine.createSpy('setFoo')
                }
            });
            // excute
            potion.foo = 'baz';
            var result = potion.foo;
            // verify
            expect(potion.getFoo).toHaveBeenCalled();
            expect(potion.setFoo).toHaveBeenCalledWith('baz');
            expect(result).toBe('bar');
        });

        it('allows to define attributes with anonymous getter and setter function', function () {
            // prepare
            var getter = jasmine.createSpy('getter').andReturn('bar');
            var setter = jasmine.createSpy('setter');
            var potion = alchemy.brew({
                overrides: {
                    foo: alchemy.defineProperty({
                        get: getter,
                        set: setter,
                    })
                }
            });
            // excute
            potion.foo = 'baz';
            var result = potion.foo;
            // verify
            expect(getter).toHaveBeenCalled();
            expect(setter).toHaveBeenCalledWith('baz');
            expect(result).toBe('bar');
        });

        it('allows to override attribute getter/setter', function () {
            // prepare
            var potion1 = alchemy.brew({
                overrides: {
                    foo: alchemy.defineProperty({get: true}),
                    getFoo: function () {
                        return 'foo';
                    }
                }
            });
            var potion2 = alchemy.brew({
                extend: potion1,
                overrides: {
                    getFoo: alchemy.override(function (_super) {
                        return function () {
                            return _super.call(this) + ' - bar';
                        };
                    })
                }
            });
            // excute
            var result = potion2.foo;
            // verify
            expect(result).toBe('foo - bar');
        });

        it('allows the overrides to be a function wich is called with the super type', function () {
            // prepare
            var p1 = alchemy.brew({
                overrides: {
                    foo: function () {
                        return 'foo';
                    },
                },
            });
            // execute
            var overrides = jasmine.createSpy('overrides').andCallFake(function (_super) {
                return {
                    foo: function () {
                        return _super.foo() + ' - bar';
                    },
                };
            });
            var p2 = alchemy.brew({
                extend: p1,
                overrides: overrides
            });
            // verify
            expect(overrides).toHaveBeenCalledWith(p1);
            expect(p2.foo()).toBe('foo - bar');
        });
    });

    /** @name TEST_now */
    describe('now', function () {
        it('returns a number >= 0', function () {
            expect(alchemy.isNumber(alchemy.now())).toBeTruthy();
            expect(alchemy.now() >= 0).toBeTruthy();
        });

        it('is monoton', function () {
            var n1 = alchemy.now();
            var n2 = alchemy.now();
            expect(n2 >= n1).toBeTruthy();
        });
    });
});

