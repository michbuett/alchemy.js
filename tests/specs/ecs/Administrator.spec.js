describe('alchemy.ecs.AdministratorNG', function () {
    'use strict';

    var Administrator = require('./../../../lib/Administrator');

    it('allows to define entities depending on app state', function () {
        // prepare
        var entityDef = jasmine.createSpy();
        var state = {};
        var testSubject = Administrator.brew({
            entities: entityDef,
            systems: [],
        });

        // execute
        testSubject.update(state);

        // verify
        expect(entityDef).toHaveBeenCalledWith(state);
    });

    it('allows to define entities depending on app state', function () {
        // prepare
        var entityDef = function () { return []; };
        var system1 = { update: jasmine.createSpy() };
        var system2 = { update: jasmine.createSpy() };
        var state = {};
        var testSubject = Administrator.brew({
            entities: entityDef,
            systems: [system1, system2],
        });

        // execute
        testSubject.update(state);

        // verify
        expect(system1.update).toHaveBeenCalled();
        expect(system2.update).toHaveBeenCalled();
    });

    it('allows to travers the entities in depth-first order', function () {
        // prepare
        var entityDef = function () {
            return [{
                id: 'e0',
                children: [{
                    id: 'e00',
                    children: [{
                        id: 'e000',
                        children: [{
                            id: 'e0000'
                        }]
                    }]
                }, {
                    id: 'e01',
                    children: [{
                        id: 'e010'
                    }, {
                        id: 'e011',
                        children: [{
                            id: 'e0110'
                        }, {
                            id: 'e0111'
                        }]
                    }, {
                        id: 'e012'
                    }]
                }]
            }, {
                id: 'e1',
            }, {
                id: 'e2',
            }];
        };
        var expectedOrder = [
            'e0', 'e00', 'e000', 'e0000', 'e01', 'e010',
            'e011', 'e0110', 'e0111', 'e012', 'e1', 'e2'
        ];

        var actualEntities = null;
        var forEachCb = jasmine.createSpy();
        var forEachCtxt = {};
        var testSubject = Administrator.brew({
            entities: entityDef,
            systems: [{
                update: function (entities) {
                    actualEntities = entities;
                }
            }],
        });

        // execute
        testSubject.update({});

        // verify
        expect(actualEntities instanceof Map).toBeTruthy();
        expect(actualEntities.size).toBe(expectedOrder.length);

        actualEntities.forEach(forEachCb, forEachCtxt);
        var allCalls = forEachCb.calls.all();
        for (var i = 0; i < expectedOrder.length; i++) {
            expect(allCalls[i].args[0].id).toBe(expectedOrder[i]);
            expect(allCalls[i].args[1]).toBe(expectedOrder[i]);
        }
    });

    it('skips all updates if state remains unchanged', function () {
        // prepare
        var entityDef = jasmine.createSpy();
        var system1 = { update: jasmine.createSpy() };
        var system2 = { update: jasmine.createSpy() };
        var state = {};
        var testSubject = Administrator.brew({
            entities: entityDef,
            systems: [system1, system2],
        });

        // execute
        testSubject.update(state);
        testSubject.update(state);
        testSubject.update(state);

        // verify
        expect(entityDef.calls.count()).toBe(1);
        expect(system1.update.calls.count()).toBe(1);
        expect(system2.update.calls.count()).toBe(1);
    });
});
