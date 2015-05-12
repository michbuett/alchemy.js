(function () {
    'use strict';

    // console.log('tests.InstanceCreation', __dirname);
    var alchemy = require('../../../lib/core/Alchemy.js');

    /**
     * Description
     *
     * @class
     * @name tests.InstanceCreation
     * @extends alchemy.core.MateriaPrima
     */
    alchemy.formula.add({
        name: 'tests.InstanceCreation',
        extend: 'alchemy.core.MateriaPrima',
        overrides: {
            getTestSuite: function () {
                function ClassA(cfg) {
                    cfg = cfg || {};
                    cfg.id = cfg.id || alchemy.id();
                    alchemy.override(this, cfg);
                }

                function ClassB(cfg) {
                    ClassA.prototype.constructor.call(this, cfg);
                }
                ClassB.prototype = Object.create(ClassA.prototype);

                var potionA = alchemy.brew({});

                var potionB = alchemy.brew({
                    extend: potionA,
                });

                return {
                    name: 'Create instances',
                    tests: [{
                        name: 'ClassA',
                        test: function () {
                            return new ClassA({x: 0, y: 1});
                        }
                    }, {
                        name: 'ClassB',
                        test: function () {
                            return new ClassB({x: 0, y: 1});
                        }
                    }, {
                        name: 'Potion A',
                        test: function () {
                            return potionA.brew({x: 0, y: 1});
                        }
                    }, {
                        name: 'Potion B',
                        test: function () {
                            return potionB.brew({x: 0, y: 1});
                        }
                    }]
                };
            }
        }
    });
}());
