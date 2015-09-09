(function () {
    'use strict';

    var immutable = require('immutabilis');
    var alchemy = require('./../core/Alchemy.js');

    /**
     * @class
     * @name alchemy.web.Visio
     */
    alchemy.formula.add({
        name: 'alchemy.web.Visio',

        requires: [
            'alchemy.vendor.virtualDom',
        ],

        overrides: function (_super) {
            var virtualDom = alchemy('virtualDom');
            var h = virtualDom.h;
            var diff = virtualDom.diff;
            var patch = virtualDom.patch;

            return {
                /** @lends alchemy.web.Visio.prototype */

                /**
                 * The root node of this component
                 *
                 * @property
                 * @type DomNode
                 * @private
                 */
                root: null,

                /**
                 * The virtual dom tree created by this component's render method
                 *
                 * @property tree
                 * @type VTree
                 * @private
                 */
                tree: null,

                /**
                 * The set of subcomponents
                 *
                 * @property subs
                 * @type Object
                 * @protected
                 */
                subs: null,

                constructor: function (cfg) {
                    _super.constructor.call(this, cfg);

                    /**
                     * The internal state for this UI component (the date
                     * model), usually a subset of the application state)
                     *
                     * @property state
                     * @type Immutable
                     * @private
                     */
                    this.state = immutable.fromJS(this.initialState);
                },


                draw: function (state) {
                    if (this.processStateChanges(state) || !this.tree) {

                        // some date which presented by this UI component has
                        // changed and the component and its sub-components need
                        // to be re-rendered

                        alchemy.each(this.subs, function (sub) {
                            sub.processStateChanges(state);
                        }, this);

                        var oldTree = this.tree || h(); // TODO: get VTree from actual DOM
                        var newTree = this.render();
                        var patches = diff(oldTree, newTree);

                        this.root = patch(this.root, patches);
                        this.tree = newTree;

                        alchemy.each(this.subs, this.updateSubRoot, this);

                        this.delegateEvents(this);
                    } else {

                        // no data relevant for this component has changed
                        // -> continue with its subcomponents
                        alchemy.each(this.subs, this.drawSub, this, [state]);
                    }
                },


                //
                //
                // protected
                //
                //

                renderSubs: function (id) {
                    var result = [];

                    alchemy.each(this.subs, function (sub) {
                        result.push(this.renderSub(sub));
                    }, this);

                    return result;
                },

                renderSub: function (id) {
                    var sub = alchemy.isObject(id) ? id : this.subs[id];
                    if (sub && sub.render) {
                        sub.tree = sub.render();
                        return sub.tree;
                    }
                    throw 'Invalid subcomponent: ' + id;
                },

                /**
                 * Creates the virtual dom tree. Override to create custom markup
                 * @protected
                 *
                 * @return VTree the virtual dom tree
                 */
                render: function () {
                    return this.h('div#' + this.id, null, this.renderSubs());
                },

                /**
                 * Updates the internal state of the current UI component
                 * @protected
                 *
                 * @param {Immutable} state The current application state
                 * @return VTree the new component state
                 */
                updateState: function (state) {
                    return state;
                },

                h: h,


                //
                //
                // private helper
                //
                //

                /** @private */
                drawSub: function (sub, key, state) {
                    sub.draw(state);
                },

                /** @private */
                updateSubRoot: function (sub) {
                    sub.root = this.root.querySelector(sub.selector || '#' + sub.id);
                },

                /** @private */
                processStateChanges: function (appState) {
                    var currentState = this.state;
                    var newState = this.updateState(appState) || this.state;

                    if (newState !== currentState) {
                        this.state = newState;
                        return true;
                    }

                    return false;
                },

                /** @private */
                delegateEvents: function (visio) {
                    alchemy.each(visio.events, visio.delegateSingleEvent, visio);
                    alchemy.each(visio.subs, visio.delegateEvents, visio);
                },

                /** @private */
                delegateSingleEvent: function (name, key) {
                    var delegator = this.delegator;
                    if (!delegator) {
                        return;
                    }

                    var handler = this[name];
                    var split = key.split(' ');
                    var event = split.shift();
                    var elements = this.findElements(split.join(' '));

                    for (var i = 0, l = elements.length; i < l; i++) {
                        delegator.delegate(elements[i], event, handler, this);
                    }
                },

                /** @private */
                findElements: function (selector) {
                    if (selector) {
                        return this.root.querySelectorAll(selector);
                    }

                    return [this.root];
                },
            };
        }
    });
}());



