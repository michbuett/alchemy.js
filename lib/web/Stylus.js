module.exports = function (alchemy) {
    'use strict';

    alchemy.formula.define('alchemy.web.Stylus', [
        'alchemy.core.MateriaPrima'

    ], function (MateriaPrima) {
        return alchemy.extend(MateriaPrima, {
        /** @lends alchemy.web.Stylus.prototype */

            /** @override */
            constructor: function (cfg) {
                /**
                 * An internal store for rule meta informations
                 *
                 * @property rules
                 * @type Object
                 * @private
                 */
                this.rules = {};

                /**
                 * The CssStyleSheet that stores all css rules
                 *
                 * @property sheet
                 * @type CssStyleSheet
                 * @private
                 */
                this.sheet = undefined;

                MateriaPrima.constructor.call(this, cfg);
            },

            /** @override */
            dispose: function () {
                while (this.sheet && this.sheet.cssRules.length > 0) {
                    this.sheet.deleteRule(0);
                }

                this.sheet = null;
                this.rules = null;

                MateriaPrima.dispose.call(this);
            },

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
                alchemy.each(this.prepare(rules, {}, ''), this.setRule, this);
            },


            /** @private */
            prepare: function (raw, result, selector) {
                alchemy.each(raw, function (value, key) {
                    if (alchemy.isObject(value)) {
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
                alchemy.each(rule, function (value, key) {
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
        });
    });
};
