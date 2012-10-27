describe('core.Oculus', function () {
    'use strict';

    var alchemy = require('../lib/core/Alchemy.js');

    beforeEach(function () {
        this.oculus = alchemy('core.Oculus').create();
    });

    afterEach(function () {
        this.oculus.dispose();
    });

    describe('Listeners and event trigger', function () {
        it('allows to add listner', function () {
            // prepare
            var spy = jasmine.createSpy('test');
            var data = {foo: 'bar'};
            this.oculus.on('myEvent', spy);
            // execute
            this.oculus.trigger('myEvent', data);
            // verify
            expect(spy).toHaveBeenCalled();
            expect(spy.mostRecentCall.args[0]).toBe(data);
        });

        it('allows to add mutiple listners for the same event', function () {
            // prepare
            var spy1 = jasmine.createSpy('listener 1');
            var spy2 = jasmine.createSpy('listener 2');
            var spy3 = jasmine.createSpy('listener 3');
            this.oculus.on('myEvent', spy1);
            this.oculus.on('myEvent', spy2);
            this.oculus.on('myEvent', spy3);
            // execute
            this.oculus.trigger('myEvent');
            // verify
            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
            expect(spy3).toHaveBeenCalled();
        });

        it('calls the listener in the correct scope', function () {
            // prepare
            var spy = jasmine.createSpy('listener').andCallFake(function () {
                actualScope = this;
            });
            var expectedScope = {};
            var actualScope;
            this.oculus.on('myEvent', spy, expectedScope);
            // execute
            this.oculus.trigger('myEvent');
            // verify
            expect(actualScope).toBe(expectedScope);
        });
    });
});
