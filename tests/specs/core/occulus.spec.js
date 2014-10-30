describe('Oculus', function () {
    'use strict';

    var alchemy = require('./../../../lib/core/Alchemy.js');

    beforeEach(function () {
        this.oculus = alchemy('alchemy.core.Oculus').brew();
        this.observable = alchemy('alchemy.core.Observari').brew();
    });

    afterEach(function () {
        this.oculus.dispose();
        this.observable.dispose();
    });

    /** @name TEST_observe */
    describe('observe', function () {

        it('allows to add handler to other observeable objects', function () {
            // prepare
            var arg = {foo: 'bar'};
            var spy = jasmine.createSpy('handler');
            this.oculus.observe(this.observable, 'party', spy);
            // execute
            this.observable.trigger('party', arg);
            // verify
            expect(spy.mostRecentCall.args[0]).toBe(arg);
            expect(spy.mostRecentCall.args[1].name).toBe('party');
            expect(spy.mostRecentCall.args[1].source).toBe(this.observable);
        });

        it('uses the correct scope', function () {
            // prepare
            var scope = {};
            var actualScope;
            var spy = jasmine.createSpy('handler').andCallFake(function () {
                actualScope = this;
            });
            this.oculus.observe(this.observable, 'party', spy, scope);
            // execute
            this.observable.trigger('party');
            // verify
            expect(actualScope).toBe(scope);
        });

        it('removes listeners from observed objects on dispose', function () {
            // prepare
            var spy = jasmine.createSpy('handler');
            this.oculus.observe(this.observable, 'party', spy);
            // execute
            this.oculus.dispose();
            this.observable.trigger('party');
            // verify
            expect(spy).not.toHaveBeenCalled();
        });
    });

    /** @name TEST_mixin */
    describe('observable aspect', function () {
        it('give any existing potion to observe other objects', function () {
            // prepare
            var anyObj = alchemy('MateriaPrima').brew();
            // execute
            anyObj.addIngredient('observer', this.oculus);
            // verify
            expect(typeof anyObj.observe).toBe('function');
            expect(typeof anyObj.isObservable).toBe('function');
        });

        it('give new potion to observe other object', function () {
            // prepare
            // execute
            var anyPotion = alchemy.brew({
                ingredients: {
                    observer: 'Oculus'
                }
            });
            // verify
            expect(typeof anyPotion.observe).toBe('function');
            expect(typeof anyPotion.isObservable).toBe('function');
        });
    });

});
