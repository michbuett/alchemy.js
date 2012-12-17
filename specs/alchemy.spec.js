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
    });

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

    describe('override', function () {
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
            alchemy.override(obj, {
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
            alchemy.override(obj, {
                foo: function () {
                    return _super.call(this) + ' - bar';
                }
            });
            alchemy.override(obj, {
                foo: function () {
                    return _super.call(this) + ' - baz';
                }
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
            var newCtor = function () {
                this.bar = 'bar';
                _super.call(this);
            };
            //execute
            alchemy.override(obj, {
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
            obj = alchemy.override(obj, {
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
            alchemy.override(obj, {
                foo: function () {
                    _super.call(this);
                }
            });
            spyOn(obj, 'foo').andCallThrough();
            // execute
            obj.foo();
            // verify
            expect(orgFoo).toHaveBeenCalled();
        });
    });

    describe('brew', function () {
        it('can load formulas', function () {
            // prepare
            // execute
            var mp = alchemy('MateriaPrima');
            // verify
            expect(mp).toBeDefined();
            expect(typeof mp.create).toBe('function');
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
            expect(potion.getMetaAttr('name')).toBe('dummy');
            expect(potion.getMetaAttr('supertype')).toBe(alchemy('MateriaPrima'));
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
            expect(potion2.getMetaAttr('supertype')).toBe(potion1);
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
                    foo: function () {
                        return _super.call(this) + ' - bar';
                    }
                }
            });
            var potion3 = alchemy.brew({
                extend: potion2,
                overrides: {
                    foo: function () {
                        return _super.call(this) + ' - baz';
                    }
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
                    foo: function () {
                        return _super.call(this) + ' - foo';
                    }
                }
            });
            var potion2 = alchemy.brew({
                extend: base,
                overrides: {
                    foo: function () {
                        return _super.call(this) + ' - bar';
                    }
                }
            });
            var potion3 = alchemy.brew({
                extend: base,
                overrides: {
                    foo: function () {
                        return _super.call(this) + ' - baz';
                    }
                }
            });
            // third override (override the different versions to check if there are conflicts)
            var potion2Sub = alchemy.brew({
                extend: potion2,
                overrides: {
                    foo: function () {
                        return _super.call(this) + ' - sub';
                    }
                }
            });
            var potion3Sub = alchemy.brew({
                extend: potion3,
                overrides: {
                    foo: function () {
                        return _super.call(this) + ' - sub';
                    }
                }
            });
            expect(potion1.foo()).toBe('base - foo');
            expect(potion2.foo()).toBe('base - bar');
            expect(potion3.foo()).toBe('base - baz');
            expect(potion2Sub.foo()).toBe('base - bar - sub');
            expect(potion3Sub.foo()).toBe('base - baz - sub');
        });
    });
});

