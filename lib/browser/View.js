/*global $*/
(function () {
    'use strict';

    var alchemy = require('./alchemy.js');

    /**
     * Description
     *
     * @class alchemy.browser.View
     * @extends Oculus
     */
    alchemy.formula.add({
        name: 'alchemy.browser.View',
        extend: 'alchemy.core.Oculus',
        overrides: {
            template: '<div id="<$=data.id$>" class="<$=data.cls$>"><$=data.items$></div>',

            getData: function () {
                return {
                    id: this.id,
                    cls: this.cls
                };
            },

            render: function (ctxt) {
                ctxt.push(alchemy.render(this.template, this.getData()));
                return ctxt;
            },

            /**
             * Adds new style class(es) to the view element
             *
             * @param {String/Array} newCls
             *      the style class(es) to add
             *
             * @example
             *      el.addClass('foo');
             *      el.addClass('foo bar baz');
             *      el.addClass(['foo', 'bar', 'baz']);
             */
            addClass: function (newCls) {
                if (alchemy.isString(newCls)) {
                    newCls = newCls.trim();
                    if (newCls.indexOf(' ') > 0) {
                        newCls = newCls.split(' ');
                    }
                }

                if (alchemy.isArray(newCls)) {
                    alchemy.each(newCls, this.addClass, this);
                } else {
                    if (this.cls) {
                        if (this.cls.indexOf(newCls) < 0) {
                            this.cls += ' ' + newCls;
                        }
                    } else {
                        this.cls = newCls;
                    }
                }
                return this;
            },

            setEl: function (el) {
                if (el) {
                    this.el = el;
                    this.$el = $(el);
                }
                return this.el;
            },

            moveTo: alchemy.emptyFn,

            update: alchemy.emptyFn,

            /**
             * Allows to observe dom events which are revoked automatically
             * when the view is disposed
             *
             * @param {String} selector The css selector for hmtl element to observe
             * @param {String} filter A selector string to filter the descendants of
             *      the selected elements that trigger the event. If the selector is
             *      null or omitted, the event is always triggered when it reaches
             *      the selected element.
             * @param {String} event The name of the event to observe
             * @param {Function} handler The event handler method
             * @param {Object} [scope] Optional. The execution context for the event
             *      handler (defaults to the current view instance)
             */
            observeDom: function (selector, filter, event, handler, scope) {
                event = event + '.' + this.id;
                scope = scope || this;
                filter = filter || null;

                // add the event handler
                $(selector).on(event, filter, handler.bind(scope));

                // store event infos so the handler can be removed if the view is destroyed
                var key = selector + '_' + event;
                this.domEvents = this.domEvents || {};
                if (!this.domEvents[key]) {
                    this.domEvents[key] = {
                        selector: selector,
                        event: event
                    };
                }
            },

            /** @protected */
            dispose: alchemy.override(function (_super) {
                // helper method to remove the listerner for a single event
                function removeDomEventListner(listener) {
                    $(listener.selector).off(listener.event);
                }

                return function () {
                    _super.call(this);

                    alchemy.each(this.domEvents, removeDomEventListner, this);
                };
            }),
        }
    });
}());

