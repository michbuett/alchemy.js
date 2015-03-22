describe('alchemy.ecs.EventSystem', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        setFixtures('<div id="foo"></div>');
    });

    it('allows to delegate DOM events to application messages', function () {
        // prepare
        var delegatus = alchemy('alchemy.web.Delegatus').brew();
        var apothecarius = initEntities();
        var testSubject = alchemy('alchemy.ecs.EventSystem').brew({
            delegator: delegatus,
            entities: apothecarius,
        });
        testSubject.addHandler('fooClick', function () {});

        // execute
        testSubject.update();

        // verify
        expect(apothecarius.getComponent('foo', 'events')).toBeFalsy();
        expect(apothecarius.getComponent('foo', 'delegatedEvents').current.val()).toEqual([{
            event: 'click',
            delegate: 0,
        }]);
    });

    it('allows to register custom handler functions when defining entity types', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.EventSystem').brew();
        var entityDescriptor = {
            getEventHandler: function () {
            },
        };
        spyOn(entityDescriptor, 'getEventHandler').andCallThrough();

        // execute
        testSubject.defineEntity(entityDescriptor);

        // verify
        expect(entityDescriptor.getEventHandler).toHaveBeenCalled();
    });

    it('ignores entity descriptors which do not provide new handle', function () {
        expect(function () {
            var testSubject = alchemy('alchemy.ecs.EventSystem').brew();
            testSubject.defineEntity({});
        }).not.toThrow();
    });

    function initEntities() {
        var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
        apothecarius.createEntity({
            id: 'foo',
            events: {
                listener: [{
                    event: 'click',
                    handler: 'fooClick',
                }]
            },
        });
        return apothecarius;
    }
});
