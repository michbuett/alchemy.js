(function () {
    'use strict';

    // console.log('tests.PropertyAccess', __dirname);
    var alchemy = require('../../../../alchemy.js');

    /**
     * Description
     *
     * @class
     * @name tests.PropertyAccess
     * @extends alchemy.core.MateriaPrima
     */
    alchemy.formula.add({
        name: 'tests.PropertyAccess',
        extend: 'alchemy.core.MateriaPrima',
        overrides: function () {
            function ClassA(x, y) {
                this.x = x;
                this.y = y;
            }

            function ClassB(x, y) {
                ClassA.prototype.constructor.call(this, x, y);
            }
            ClassB.prototype = Object.create(ClassA.prototype);

            function Hash(x, y) {
                this.x = x;
                delete this.x;
                this.x = x;
                this.y = y;
            }

            var potionA = alchemy.brew({
            });

            var potionB = alchemy.brew({
                extend: potionA,
            });

            function test(obj) {
                // return obj.x += obj.y;
                var x, y;
                for (var i = 0; i < 1000; ++i) {
                    x = obj.x;
                    y = obj.y;
                }
            }


            return {
                /** @lends test.InstanceCreation.prototype */

                getTestSuite: function () {
                    return {
                        name: 'Access object properties',
                        tests: [{
                            name: 'Instance of class A',
                            setup: function () {
                                return {
                                    args: [new ClassA(1, 1)]
                                };
                            },
                            test: test,
                        }, {
                            name: 'Instance of class B',
                            setup: function () {
                                return {
                                    args: [new ClassB(1, 1)]
                                };
                            },
                            test: test,
                        }, {
                            name: 'instance of Potion A',
                            setup: function () {
                                return {
                                    args: [potionA.brew()]
                                };
                            },
                            test: test,
                        }, {
                            name: 'instance of Potion B',
                            setup: function () {
                                return {
                                    args: [potionB.brew()]
                                };
                            },
                            test: test,
                        }, {
                            name: 'Generic object',
                            setup: function () {
                                return {
                                    args: [{x: 1, y: 1}]
                                };
                            },
                            test: test,
                        }, {
                            name: 'Hash map',
                            setup: function () {
                                return {
                                    args: [new Hash(1, 1)]
                                };
                            },
                            test: test,
                        }]
                    };
                }
            };
        }
    });
}());
