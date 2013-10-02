describe('Observari', function () {
    'use strict';

    var alchemy = require('../../alchemy.js');

    beforeEach(function () {
        this.observari = alchemy('alchemy.core.Observari').brew();
    });

    afterEach(function () {
        this.observari.dispose();
        this.observari = null;
    });

    /** @name TEST_on */
    /** @name TEST_trigger */
    describe('Listeners and event trigger', function () {
        it('allows to add listener', function () {
            // prepare
            var spy = jasmine.createSpy('test');
            var data = {foo: 'bar'};
            this.observari.on('myEvent', spy);
            // execute
            this.observari.trigger('myEvent', data);
            // verify
            expect(spy).toHaveBeenCalled();
            expect(spy.mostRecentCall.args[0]).toBe(data);
        });

        it('allows to add mutiple listeners for the same event', function () {
            // prepare
            var spy1 = jasmine.createSpy('listener 1');
            var spy2 = jasmine.createSpy('listener 2');
            var spy3 = jasmine.createSpy('listener 3');
            this.observari.on('myEvent', spy1);
            this.observari.on('myEvent', spy2);
            this.observari.on('myEvent', spy3);
            // execute
            this.observari.trigger('myEvent');
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
            this.observari.on('myEvent', spy, expectedScope);
            // execute
            this.observari.trigger('myEvent');
            // verify
            expect(actualScope).toBe(expectedScope);
        });

        it('provides an event object', function () {
            var eventname;
            var handler = function (data, event) {
                eventname = event.name;
            };
            this.observari.on('myFirstEvent', handler);
            this.observari.on('mySecondEvent', handler);

            // first trigger with params
            this.observari.trigger('myFirstEvent', {foo: 'bar'});
            expect(eventname).toBe('myFirstEvent');
            eventname = 0;

            // second trigger without params
            this.observari.trigger('mySecondEvent');
            expect(eventname).toBe('mySecondEvent');
        });
    });

    /** @name TEST_off */
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
                this.observari.on(l.event, l.fn, l.scope);
            }, this);
        });

        it('can remove a single listener', function () {
            // prepare
            this.observari.off(listeners[0].event, listeners[0].fn, listeners[0].scope);
            // execute
            events.forEach(this.observari.trigger, this.observari);
            // verify
            expect(listeners[0].fn).not.toHaveBeenCalled();
            expect(listeners[1].fn).toHaveBeenCalled();
            expect(listeners[2].fn).toHaveBeenCalled();
            expect(listeners[3].fn).toHaveBeenCalled();
        });

        it('can remove all listeners for an event', function () {
            // prepare
            this.observari.off(specialEvent);
            // execute
            events.forEach(this.observari.trigger, this.observari);
            // verify
            expect(listeners[0].fn).not.toHaveBeenCalled();
            expect(listeners[1].fn).not.toHaveBeenCalled();
            expect(listeners[2].fn).toHaveBeenCalled();
            expect(listeners[3].fn).toHaveBeenCalled();
        });

        it('can remove all listeners for a handler function', function () {
            // prepare
            this.observari.off(null, listeners[1].fn);
            // execute
            events.forEach(this.observari.trigger, this.observari);
            // verify
            expect(listeners[0].fn).toHaveBeenCalled();
            expect(listeners[1].fn).not.toHaveBeenCalled();
            expect(listeners[2].fn).toHaveBeenCalled();
            expect(listeners[3].fn).toHaveBeenCalled();
        });

        it('can remove all listeners for given scope', function () {
            // prepare
            this.observari.off(null, null, specialScope);
            // execute
            events.forEach(this.observari.trigger, this.observari);
            // verify
            expect(listeners[0].fn).not.toHaveBeenCalled();
            expect(listeners[1].fn).toHaveBeenCalled();
            expect(listeners[2].fn).not.toHaveBeenCalled();
            expect(listeners[3].fn).toHaveBeenCalled();
        });

        it('can remove all listeners at once', function () {
            // prepare
            this.observari.off();
            // execute
            events.forEach(this.observari.trigger, this.observari);
            // verify
            expect(listeners[0].fn).not.toHaveBeenCalled();
            expect(listeners[1].fn).not.toHaveBeenCalled();
            expect(listeners[2].fn).not.toHaveBeenCalled();
            expect(listeners[3].fn).not.toHaveBeenCalled();
            expect(this.observari.events).toEqual({});
        });
    });

    /** @name TEST_once */
    describe('once', function () {
        it('allows to add an one-time listener', function () {
            // prepare
            var spy = jasmine.createSpy('handler');
            this.observari.once('party', spy);
            // execute
            this.observari.trigger('party');
            this.observari.trigger('party');
            this.observari.trigger('party');
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
            this.observari.once('myEvent', spy, expectedScope);
            // execute
            this.observari.trigger('myEvent');
            // verify
            expect(actualScope).toBe(expectedScope);
        });

        it('does not cause a crash when used with other listeners', function () {
            // prepare
            var onetimeListener = jasmine.createSpy();
            var otherListener1 = jasmine.createSpy();
            var otherListener2 = jasmine.createSpy();
            this.observari.once('myEvent', onetimeListener);
            this.observari.on('myEvent', otherListener1);
            this.observari.on('myEvent', otherListener2);
            // execute
            this.observari.trigger('myEvent');
            this.observari.trigger('myEvent');
            // verify
            expect(onetimeListener.callCount).toBe(1);
            expect(otherListener1.callCount).toBe(2);
            expect(otherListener2.callCount).toBe(2);
        });
    });

    /** @name TEST_mixin */
    describe('observable aspect', function () {
        it('allows to make any potion observable', function () {
            // prepare
            var anyObj = alchemy('MateriaPrima').brew();
            // execute
            anyObj.addIngredient('observari', this.observari);
            // verify
            expect(typeof anyObj.on).toBe('function');
            expect(typeof anyObj.off).toBe('function');
            expect(typeof anyObj.once).toBe('function');
            expect(typeof anyObj.trigger).toBe('function');
        });

        it('allows to make new potions observable', function () {
            // prepare
            // execute
            var anyPotion = alchemy.brew({
                ingredients: {
                    observable: 'Observari'
                }
            });
            // verify
            expect(typeof anyPotion.on).toBe('function');
            expect(typeof anyPotion.off).toBe('function');
            expect(typeof anyPotion.once).toBe('function');
            expect(typeof anyPotion.trigger).toBe('function');
        });
    });
});
