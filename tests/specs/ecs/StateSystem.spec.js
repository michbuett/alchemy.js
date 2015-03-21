describe('alchemy.web.StateSystem', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        setFixtures(sandbox());

        this.apothecarius = alchemy('alchemy.ecs.Apothecarius').brew();

        initEntities(this.apothecarius);
    });

    it('TODO: name test', function () {
        // prepare
        var testSubject = alchemy('alchemy.ecs.StateSystem').brew({
            entites: this.apothecarius
        });

        // execute
        testSubject.update();

        // verify
    });


    function initEntities(apothecarius) {
    }
});
