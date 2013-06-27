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

            update: alchemy.emptyFn
        }
    });
}());

