describe('alchemy.lib.Oculus', function () {
    'use strict';

    var Oculus = require('./../../lib/Oculus');
    var Observari = require('./../../lib/Observari');

    beforeEach(function () {
        this.oculus = Oculus.brew();
        this.observable = Observari.brew();
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

        it('ignores non-observable objects', function () {
            // prepare
            var obj = {
                on: jasmine.createSpy('on'),
            };

            // execute
            this.oculus.observe(obj, 'foo', function () {});

            // verify
            expect(obj.on).not.toHaveBeenCalled();
        });
    });
});
