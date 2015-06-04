/*global require*/
describe('alchemy.path', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        this.testSubject = new alchemy.PathModule();
    });

    describe('get', function () {
        it('returns the path for a given namespace', function () {
            expect(this.testSubject.get('alchemy')).toBe('../../lib');
        });

        it('returns all paths if namespace is omitted', function () {
            expect(this.testSubject.get()).toEqual({ alchemy: '../../lib' });
        });

        it('returns "undefined" if the given namespace is unknown', function () {
            expect(this.testSubject.get('funkyTown')).not.toBeDefined();
        });
    });

    describe('set', function () {
        it('allows to add new namespaces', function () {
            this.testSubject.set({
                myPackage: 'my/own/path'
            });
            expect(this.testSubject.get('myPackage')).toBe('my/own/path');
        });

        it('allows to override existing namespaces', function () {
            this.testSubject.set({
                myPackage: 'my/own/path'
            });
            this.testSubject.set({
                myPackage: 'my/other/path',
                alchemy: 'my/other/alchemy'
            });
            expect(this.testSubject.get('myPackage')).toBe('my/other/path');
            expect(this.testSubject.get('alchemy')).toBe('my/other/alchemy');
        });
    });

    describe('map', function () {
        beforeEach(function () {
            this.testSubject.set({
                myPackage: 'my/own/path',
                myOtherPackage: 'my/other/path'
            });
        });

        it('can resolve files of custom packages', function () {
            expect(this.testSubject.map('myPackage.MyType')).toBe('my/own/path/MyType');
            expect(this.testSubject.map('myPackage.MyOtherType')).toBe('my/own/path/MyOtherType');
            expect(this.testSubject.map('myOtherPackage.MyOtherType')).toBe('my/other/path/MyOtherType');
        });

        it('can resolve files of subpackages relative to their parents', function () {
            expect(this.testSubject.map('myPackage.sub.MyType')).toBe('my/own/path/sub/MyType');
            expect(this.testSubject.map('myOtherPackage.yellow.sub.Marine')).toBe('my/other/path/yellow/sub/Marine');
        });

        it('can resolve files of unconfigured packages to sane result', function () {
            expect(this.testSubject.map('MyType')).toBe('MyType');
            expect(this.testSubject.map('my.totally.unknown.package.Type')).toBe('my/totally/unknown/package/Type');
        });
    });
});

