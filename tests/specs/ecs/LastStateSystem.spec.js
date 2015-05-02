describe('alchemy.ecs.LastStateSystem', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    it('remembers the state.current as state.last', function () {
        // prepare
        var apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();
        var testSubject = alchemy('alchemy.ecs.LastStateSystem').brew({
            entities: apothecarius
        });

        apothecarius.createEntity({
            id: 'foo',
            state: {
                current: {},
                last: null,
            },
        });

        // execute
        testSubject.update();

        // verify
        var state = apothecarius.getComponent('foo', 'state');
        expect(state.last).toBe(state.current);
    });
});
