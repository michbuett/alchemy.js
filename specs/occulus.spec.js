describe('Oculus', function () {
    'use strict';

    var alchemy = require('../../alchemy.js');

    beforeEach(function () {
        this.oculus = alchemy('alchemy.core.Oculus').brew();
    });

    afterEach(function () {
        this.oculus.dispose();
    });

    describe('Listeners and event trigger', function () {
        it('allows to add listener', function () {
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

        it('allows to add mutiple listeners for the same event', function () {
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

        it('provides an event object', function () {
            var eventname;
            var handler = function (data, event) {
                eventname = event.name;
            };
            this.oculus.on('myFirstEvent', handler);
            this.oculus.on('mySecondEvent', handler);

            // first trigger with params
            this.oculus.trigger('myFirstEvent', {foo: 'bar'});
            expect(eventname).toBe('myFirstEvent');
            eventname = 0;

            // second trigger without params
            this.oculus.trigger('mySecondEvent');
            expect(eventname).toBe('mySecondEvent');
        });

        it('supports event namespaces', function () {
        });
    });

    describe('removing listeners', function () {
        var specialEvent = 'specialEvent';
        var events = [specialEvent, 'event2', 'event3'];
        var specialScope = {};
        var listeners = [{
            event: specialEvent,
            fn: jasmine.createSpy('listener1'),
            scope: specialScope
        }, {
            event: specialEvent,
            fn: jasmine.createSpy('listener2'),
            scope: {}
        }, {
            event: events[1],
            fn: jasmine.createSpy('listener3'),
            scope: specialScope
        }, {
            event: events[2],
            fn: jasmine.createSpy('listener4'),
            scope: {}
        }];

        beforeEach(function () {
            listeners.forEach(function (l) {
                l.fn.reset();
                this.oculus.on(l.event, l.fn, l.scope);
            }, this);
        });

        it('can remove a single listener', function () {
            // prepare
            this.oculus.off(listeners[0].event, listeners[0].fn, listeners[0].scope);
            // execute
            events.forEach(this.oculus.trigger, this.oculus);
            // verify
            expect(listeners[0].fn).not.toHaveBeenCalled();
            expect(listeners[1].fn).toHaveBeenCalled();
            expect(listeners[2].fn).toHaveBeenCalled();
            expect(listeners[3].fn).toHaveBeenCalled();
        });

        it('can remove all listeners for an event', function () {
            // prepare
            this.oculus.off(specialEvent);
            // execute
            events.forEach(this.oculus.trigger, this.oculus);
            // verify
            expect(listeners[0].fn).not.toHaveBeenCalled();
            expect(listeners[1].fn).not.toHaveBeenCalled();
            expect(listeners[2].fn).toHaveBeenCalled();
            expect(listeners[3].fn).toHaveBeenCalled();
        });

        it('can remove all listeners for a handler function', function () {
            // prepare
            this.oculus.off(null, listeners[1].fn);
            // execute
            events.forEach(this.oculus.trigger, this.oculus);
            // verify
            expect(listeners[0].fn).toHaveBeenCalled();
            expect(listeners[1].fn).not.toHaveBeenCalled();
            expect(listeners[2].fn).toHaveBeenCalled();
            expect(listeners[3].fn).toHaveBeenCalled();
        });

        it('can remove all listeners for given scope', function () {
            // prepare
            this.oculus.off(null, null, specialScope);
            // execute
            events.forEach(this.oculus.trigger, this.oculus);
            // verify
            expect(listeners[0].fn).not.toHaveBeenCalled();
            expect(listeners[1].fn).toHaveBeenCalled();
            expect(listeners[2].fn).not.toHaveBeenCalled();
            expect(listeners[3].fn).toHaveBeenCalled();
        });

        it('can remove all listeners at once', function () {
            // prepare
            this.oculus.off();
            // execute
            events.forEach(this.oculus.trigger, this.oculus);
            // verify
            expect(listeners[0].fn).not.toHaveBeenCalled();
            expect(listeners[1].fn).not.toHaveBeenCalled();
            expect(listeners[2].fn).not.toHaveBeenCalled();
            expect(listeners[3].fn).not.toHaveBeenCalled();
            expect(this.oculus.events).toEqual({});
        });
    });

    describe('observe', function () {
        beforeEach(function () {
            this.observable = alchemy('Oculus').brew();
        });
        afterEach(function () {
            this.observable.dispose();
        });

        it('allows to add handler to other observeable objects', function () {
            // prepare
            var arg = {foo: 'bar'};
            var spy = jasmine.createSpy('handler');
            this.oculus.observe(this.observable, 'party', spy);
            // execute
            this.observable.trigger('party', arg);
            // verify
            expect(spy).toHaveBeenCalledWith(arg, {name: 'party'});
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

    describe('once', function () {
        it('allows to add an one-time listener', function () {
            // prepare
            var spy = jasmine.createSpy('handler');
            this.oculus.once('party', spy);
            // execute
            this.oculus.trigger('party');
            this.oculus.trigger('party');
            this.oculus.trigger('party');
            // verify
            expect(spy).toHaveBeenCalled();
            expect(spy.callCount).toBe(1);
        });

        it('calls the listener in the correct scope', function () {
            // prepare
            var spy = jasmine.createSpy('listener').andCallFake(function () {
                actualScope = this;
            });
            var expectedScope = {};
            var actualScope;
            this.oculus.once('myEvent', spy, expectedScope);
            // execute
            this.oculus.trigger('myEvent');
            // verify
            expect(actualScope).toBe(expectedScope);
        });
    });
});
