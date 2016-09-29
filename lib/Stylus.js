module.exports = (function () {
    'use strict';

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');

    return coquoVenenum({
        /** @lends alchemy.lib.Stylus.prototype */

        /**
         * An internal store for rule meta informations
         *
         * @property rules
         * @type Object
         * @private
         */
        rules: undefined,

        /**
         * The CssStyleSheet that stores all css rules
         *
         * @property sheet
         * @type CssStyleSheet
         * @private
         */
        sheet: undefined,

        /**
         * Sets CSS rules
         *
         * @param Object rules A set of rules where the keys are the selectors
         *      and the values the css rule body
         *
         * @example
         * stylus.setRules({
         *   'div#some-id .some-class {
         *     'background': 'url("...") ...',
         *     ...
         *   },
         *
         *   '#some-other-id {
         *     ...
         *   },
         *
         *   ...
         * });
         */
        setRules: function (rules) {
            each(this.prepare(rules, {}, ''), this.setRule, this);
        },


        /** @private */
        prepare: function (raw, result, selector) {
            each(raw, function (value, key) {
                if (value && typeof value === 'object') {
                    this.prepare(value, result, this.combineSelector(selector, key));
                    return;
                }

                result[selector] = result[selector] || {};
                result[selector][key] = value;
            }, this);

            return result;
        },

        /** @private */
        combineSelector: function (parent, child) {
            var result = (parent + ' ' + child).replace(/\s*&/g, '');
            return result;
        },

        /** @private */
        setRule: function (rule, selector) {
            var ruleStr = this.createRuleStr(selector, rule);
            var sheet = this.getStyleSheet();
            var ruleData = this.rules[selector];

            if (ruleData) {
                // update existing rule
                sheet.deleteRule(ruleData.index);
            } else {
                // add new rule
                ruleData = {
                    index: sheet.cssRules.length
                };

                this.rules[selector] = ruleData;
            }

            sheet.insertRule(ruleStr, ruleData.index);
        },

        /** @private */
        createRuleStr: function (selector, rule) {
            var props = '';
            each(rule, function (value, key) {
                props += key + ':' + value + ';';
            });

            return selector + '{' + props + '}';
        },

        /** @private */
        getStyleSheet: function () {
            if (!this.sheet) {
                var styleEl = document.createElement('style');
                document.head.appendChild(styleEl);
                this.sheet = styleEl.sheet;
            }

            return this.sheet;
        },

    }).whenBrewed(function () {
        this.rules = {};

    }).whenDisposed(function () {
        while (this.sheet && this.sheet.cssRules.length > 0) {
            this.sheet.deleteRule(0);
        }
    });
}());
