(function () {
    'use strict';

    var alchemy = require('./Alchemy.js');

    /**
     * Description
     *
     * @class
     * @name test.InstanceCreation
     * @extends alchemy.core.MateriaPrima
     */
    alchemy.formula.add({
        name: 'test.InstanceCreation',
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
                        fn: function () {
                            return new ClassA();
                        }
                    }, {
                        name: 'ClassB',
                        fn: function () {
                            return new ClassB();
                        }
                    }, {
                        name: 'Potion A',
                        fn: function () {
                            return potionA.brew();
                        }
                    }, {
                        name: 'Potion B',
                        fn: function () {
                            return potionB.brew();
                        }
                    }]
                };
            }
        }
    });
}());
