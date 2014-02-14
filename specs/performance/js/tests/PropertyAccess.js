(function () {
    'use strict';

    var alchemy = require('./Alchemy.js');

    /**
     * Description
     *
     * @class
     * @name test.PropertyAccess
     * @extends alchemy.core.MateriaPrima
     */
    alchemy.formula.add({
        name: 'test.PropertyAccess',
        extend: 'alchemy.core.MateriaPrima',
        overrides: function () {
            var instanceOfClassA;
            var instanceOfClassB;
            var instanceOfPotionA;
            var instanceOfPotionB;
            var generic;
            var hash;
            var accessProp;

            function setup() {
                function ClassA(x, y) {
                    this.x = x;
                    this.y = y;
                }

                function ClassB() {}
                ClassB.prototype = new ClassA(1, 1);

                function Hash(x, y) {
                    this.x = x;
                    delete this.x;
                    this.x = x;
                    this.y = y;
                }

                var alchemy = require('./Alchemy.js');
                var potionA = alchemy.brew({
                });

                var potionB = alchemy.brew({
                    extend: potionA,
                });

                instanceOfClassA = new ClassA();
                instanceOfClassB = new ClassB();
                instanceOfPotionA = potionA.brew({x: 1, y: 1});
                instanceOfPotionB = potionB.brew({x: 1, y: 1});
                generic = {x: 1, y: 1};
                hash = new Hash(1, 1);
            }

            function teardown() {
                instanceOfClassA = null;
                instanceOfClassB = null;
                instanceOfPotionA = null;
                instanceOfPotionB = null;
                generic = null;
                hash = null;
            }

            return {
                /** @lends test.InstanceCreation.prototype */

                getTestSuite: function () {
                    return {
                        name: 'Access object properties',
                        tests: [{
                            name: 'Instance of class A',
                            setup: setup,
                            fn: function () {
                                for (var i = 0; i < 1000; ++i) {
                                    instanceOfClassA.x += instanceOfClassA.y;
                                }
                            },
                            teardown: teardown
                        }, {
                            name: 'Instance of class B',
                            setup: setup,
                            fn: function () {
                                for (var i = 0; i < 1000; ++i) {
                                    instanceOfClassB.x += instanceOfClassB.y;
                                }
                            },
                            teardown: teardown
                        }, {
                            name: 'instance of Potion A',
                            setup: setup,
                            fn: function () {
                                for (var i = 0; i < 1000; ++i) {
                                    instanceOfPotionA.x += instanceOfPotionA.y;
                                }
                            },
                            teardown: teardown
                        }, {
                            name: 'instance of Potion B',
                            setup: setup,
                            fn: function () {
                                for (var i = 0; i < 1000; ++i) {
                                    instanceOfPotionB.x += instanceOfPotionB.y;
                                }
                            },
                            teardown: teardown
                        }, {
                            name: 'Generic object',
                            setup: setup,
                            fn: function () {
                                for (var i = 0; i < 1000; ++i) {
                                    generic.x += generic.y;
                                }
                            },
                            teardown: teardown
                        }, {
                            name: 'Hash map',
                            setup: setup,
                            fn: function () {
                                for (var i = 0; i < 1000; ++i) {
                                    hash.x += hash.y;
                                }
                            },
                            teardown: teardown
                        }]
                    };
                }
            };
        }
    });
}());
