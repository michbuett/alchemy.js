describe('alchemy.ecs.StaticChildrenSystem', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        this.apothecarius = initEntities(this.apothecarius);
    });

    it('can create entities', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.StaticChildrenSystem').brew({
            entities: this.apothecarius
        });

        // execute
        testSubject.update();

        // verify
        expect(this.apothecarius.getAllComponentsOfEntity('id-bar')).toEqual({
            ping: {id: 'id-bar', value: 'ping-bar'},
            pong: {id: 'id-bar', value: 'pong-bar'},
        });
    });

    it('fills the "children"-component', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.StaticChildrenSystem').brew({
            entities: this.apothecarius
        });

        // execute
        testSubject.update();

        // verify
        var ce = this.apothecarius.getComponent('foo', 'children');
        expect(alchemy.isObject(ce)).toBeTruthy();
        expect(ce.current.val()).toEqual({
            bar: 'id-bar',
            baz: 'id-baz',
        });
    });

    it('clears the "staticChildren"-component', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.StaticChildrenSystem').brew({
            entities: this.apothecarius
        });

        // execute
        testSubject.update();

        // verify
        expect(this.apothecarius.getComponent('foo', 'staticChildren')).toBeFalsy();
    });

    it('allows do add new children to existing ones', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.StaticChildrenSystem').brew({
            entities: this.apothecarius
        });

        // execute
        testSubject.update();

        // verify
        expect(this.apothecarius.getComponent('bli', 'children').current.val()).toEqual({
            bla: 'id-bla',
            blub: 'id-blub',
        });
    });

    function initEntities() {
        var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();

        apothecarius.createEntity({
            id: 'foo',
            staticChildren: {
                bar: {
                    id: 'id-bar',
                    ping: {value: 'ping-bar'},
                    pong: {value: 'pong-bar'},
                },
                baz: {
                    id: 'id-baz',
                    ping: {value: 'ping-baz'},
                    pong: {value: 'pong-baz'},
                },
            },
        });

        apothecarius.createEntity({
            id: 'bli',
            staticChildren: {
                bla: {
                    id: 'id-bla',
                    ping: {value: 'ping-bar'},
                    pong: {value: 'pong-bar'},
                },
            },
            children: {
                current: alchemy('Immutatio').makeImmutable({
                    blub: 'id-blub'
                }),
            },
        });

        return apothecarius;
    }
});
