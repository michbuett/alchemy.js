(function () {
    'use strict';

    // console.log('tests.PropertyAccess', __dirname);
    var alchemy = require('../../../lib/core/Alchemy.js');

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
            return {
                /** @lends test.InstanceCreation.prototype */

                getTestSuite: function () {
                    var ClassA = function (x, y) {
                        this.x = x;
                        this.y = y;
                    };

                    var ClassB = function(x, y) {
                        ClassA.prototype.constructor.call(this, x, y);
                    };

                    ClassB.prototype = Object.create(ClassA.prototype);

                    var Hash = function (x, y) {
                        this.x = x;
                        delete this.x;
                        this.x = x;
                        this.y = y;
                    };

                    var potionA = alchemy.brew({});
                    var potionB = alchemy.brew({extend: potionA});

                    function test(obj) {
                        var x, y;
                        for (var i = 0; i < 1000; ++i) {
                            x = obj.x;
                            y = obj.y;
                        }
                    }

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
                                    args: [potionA.brew({x: 1, y: 1})]
                                };
                            },
                            test: test,
                        }, {
                            name: 'instance of Potion B',
                            setup: function () {
                                return {
                                    args: [potionB.brew({x: 1, y: 1})]
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
