/*global require*/
describe('alchemy.path', function () {
    'use strict';

    var alchemy = require('../../alchemy.js');
    var initialSettings = alchemy.path.get();

    afterEach(function () {
        alchemy.path.reset();
        alchemy.path.set(initialSettings);
    });

    describe('get', function () {
        it('returns the path for a given namespace', function () {
            expect(alchemy.path.get('MateriaPrima')).toBe(initialSettings.MateriaPrima);
        });

        it('returns all paths if namespace is omitted', function () {
            expect(alchemy.path.get()).toEqual(initialSettings);
        });

        it('returns "undefined" if the given namespace is unknown', function () {
            expect(alchemy.path.get('funkyTown')).not.toBeDefined();
        });
    });

    describe('set', function () {
        it('allows to add new namespaces', function () {
            alchemy.path.set({
                myPackage: 'my/own/path'
            });
            expect(alchemy.path.get('myPackage')).toBe('my/own/path');
        });

        it('allows to override existing namespaces', function () {
            alchemy.path.set({
                myPackage: 'my/own/path'
            });
            alchemy.path.set({
                myPackage: 'my/other/path',
                MateriaPrima: 'my/MateriaSecundus'
            });
            expect(alchemy.path.get('myPackage')).toBe('my/other/path');
            expect(alchemy.path.get('MateriaPrima')).toBe('my/MateriaSecundus');
        });

        it('allows to change the paths of all core modules at once', function () {
            alchemy.path.set({
                core: 'my/path'
            });
            expect(alchemy.path.get('MateriaPrima')).toBe('my/path/MateriaPrima');
            expect(alchemy.path.get('Ingredient')).toBe('my/path/Ingredient');
            expect(alchemy.path.get('Oculus')).toBe('my/path/Oculus');
        });
    });

    describe('reset', function () {
        it('can remove configured packages', function () {
            alchemy.path.set({
                myPackage: 'my/own/path'
            });
            alchemy.path.reset();
            expect(alchemy.path.get('myPackage')).not.toBeDefined();
        });
    });

    describe('map', function () {
        beforeEach(function () {
            alchemy.path.set({
                myPackage: 'my/own/path',
                myOtherPackage: 'my/other/path'
            });
        });

        it('can resolve files of custom packages', function () {
            expect(alchemy.path.map('myPackage.MyType')).toBe('my/own/path/MyType');
            expect(alchemy.path.map('myPackage.MyOtherType')).toBe('my/own/path/MyOtherType');
            expect(alchemy.path.map('myOtherPackage.MyOtherType')).toBe('my/other/path/MyOtherType');
        });

        it('can resolve files of subpackages relative to their parents', function () {
            expect(alchemy.path.map('myPackage.sub.MyType')).toBe('my/own/path/sub/MyType');
            expect(alchemy.path.map('myOtherPackage.yellow.sub.Marine')).toBe('my/other/path/yellow/sub/Marine');
        });

        it('can resolve files of unconfigured packages to sane result', function () {
            expect(alchemy.path.map('MyType')).toBe('MyType');
            expect(alchemy.path.map('my.totally.unknown.package.Type')).toBe('my/totally/unknown/package/Type');
        });
    });
});

