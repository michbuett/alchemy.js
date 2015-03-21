describe('alchemy.web.HierarchySystem', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        setFixtures(sandbox());

        this.apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();

        initEntities(this.apothecarius);
    });

    it('allows to delegate event handler', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.EventSystem').brew({
            entites: this.apothecarius
        });

        // execute
        testSubject.update();

        // verify
    });


    function initEntities(apothecarius) {
    }
});
