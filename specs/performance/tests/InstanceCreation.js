(function () {
    'use strict';

    // console.log('tests.InstanceCreation', __dirname);
    var alchemy = require('../../../../alchemy.js');

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
                function ClassA() {
                    this.f1 = 0;
                    this.f2 = 1;
                }

                function ClassB() {}
                ClassB.prototype = new ClassA();

                var potionA = alchemy.brew({
                    overrides: {
                        init: function () {
                            this.f1 = 0;
                            this.f2 = 1;
                        }
                    }
                });

                var potionB = alchemy.brew({
                    extend: potionA,
                });

                return {
                    name: 'Create instances',
                    tests: [{
                        name: 'ClassA',
                        test: function () {
                            return new ClassA();
                        }
                    }, {
                        name: 'ClassB',
                        test: function () {
                            return new ClassB();
                        }
                    }, {
                        name: 'Potion A',
                        test: function () {
                            return potionA.brew();
                        }
                    }, {
                        name: 'Potion B',
                        test: function () {
                            return potionB.brew();
                        }
                    }]
                };
            }
        }
    });
}());
