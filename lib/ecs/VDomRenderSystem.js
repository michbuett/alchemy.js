module.exports = (function () {
    'use strict';

    var h = require('virtual-dom/h');
    var diff = require('virtual-dom/diff');
    var patch = require('virtual-dom/patch');

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');

    var utils = require('./../core/Alchemy.js');

    /**
     * @class
     * @name RenderContext
     */
    function RenderContext(id, state, props, children) {
        this._entityPlaceholder = null;

        /**
         * @property
         * @name entityId
         * @type String
         * @memberOf RenderContext
         */
        this.entityId = id;

        /**
         * @property
         * @name state
         * @type Immutable
         * @memberOf RenderContext
         */
        this.state = state;

        /**
         * @property
         * @name props
         * @type Object
         * @memberOf RenderContext
         */
        this.props = props;

        /**
         * @property
         * @name children
         * @type Array/Object
         * @memberOf RenderContext
         */
        this.children = children;
    }

    /**
     * The hyperscript function to create virtual dom nodes
     * @function
     */
    RenderContext.prototype.h = h;

    /**
     * Renders a child entity at the current location (it actually creates a
     * placeholder for that very entity)
     *
     * @param {String} entityId The id of the child entity to be rendered
     * @return VDom a virtual dom node representing the child entity
     */
    RenderContext.prototype.placeholder = function placeholder(entityId) {
        this._entityPlaceholder = this._entityPlaceholder || [];
        this._entityPlaceholder.push(entityId);

        return h('div', {id: entityId, key: entityId});
    };


    /**
     * Renders a placeholder for a child entity defined by the given key
     *
     * @param {String} key The key of the child entity to be rendered
     * @return VDom a virtual dom node representing the child entity
     */
    RenderContext.prototype.renderChild = function renderChild(key) {
        return this.placeholder(this.children[key]);
    };

    /**
     * Renderes all available child entites
     *
     * @return array An array of virtual dom nodes
     */
    RenderContext.prototype.renderAllChildren = function renderAllChildren() {
        return each(utils.values(this.children), this.placeholder, this) || [];
    };

    /**
     * An application module to render all view components
     * to the screen
     *
     * @class
     * @name alchemy.ecs.VDomRenderSystem
     */
    return coquoVenenum({
        /** @lends alchemy.ecs.VDomRenderSystem.prototype */

        /**
         * The entity storage
         *
         * @property entities
         * @type alchemy.ecs.Apothecarius
         * @private
         */
        entities: undefined,

        /**
         * The browser event delegator
         *
         * @property delegator
         * @type alchemy.web.Delegatus
         * @private
         */
        delegator: undefined,


        /**
         * Updates the component system (updates dom depending on the current
         * state of the entities)
         */
        update: function () {
            var renderConfigs = this.entities.getAllComponentsOfType('vdom');
            var updates = each(renderConfigs, this.updateEntity, this);

            each(updates, this.draw, this);
        },

        /** @private */
        updateEntity: function (cfg, entityId, placeholder) {
            if (!this.requiresRender(cfg, entityId)) {
                return;
            }

            var renderer = this.findRenderer(cfg, entityId);
            var state = this.entities.getComponent(entityId, 'state');
            var children = this.entities.getComponentData(entityId, 'children');
            var context = new RenderContext(entityId, state, cfg.props, children, {});

            cfg = this.entities.setComponent(entityId, 'vdom', {
                currentTree: renderer(context),
                placeholder: context._entityPlaceholder,
            });

            this.lastStates[entityId] = state;

            return cfg;
        },

        /** @private */
        requiresRender: function (renderCfg, entityId) {
            if (!renderCfg.currentTree) {
                return true;
            }

            var currentState = this.entities.getComponent(entityId, 'state');
            var lastState = this.lastStates[entityId];
            if (currentState !== lastState) {
                return true;
            }

            var currentDelEv = this.entities.getComponent(entityId, 'delegatedEvents');
            var lastDelEv = this.lastDelegates[entityId];
            if (currentDelEv !== lastDelEv) {
                return true;
            }

            return false;
        },

        /** @private */
        findRenderer: function (cfg, entityId) {
            if (typeof cfg.renderer === 'function') {
                return cfg.renderer;
            }

            if (typeof cfg.renderer === 'string') {
                return utils(cfg.renderer).render;
            }

            throw 'Cannot determine renderer for entity "' + entityId + '"!';
        },

        /** @private */
        draw: function (renderCfg, entityId) {
            var root = renderCfg.root || document.getElementById(entityId);
            if (!root) {
                return;
            }

            var patches = diff(renderCfg.lastTree || h(), renderCfg.currentTree);

            root = patch(root, patches);

            renderCfg = this.entities.setComponent(entityId, 'vdom', {
                root: root,
                lastTree: renderCfg.currentTree,
            });

            each(renderCfg.placeholder, this.drawDependentEntities, this);

            var delegatedEvents = this.entities.getComponent(entityId, 'delegatedEvents');
            if (delegatedEvents) {
                each(delegatedEvents.val(), this.delegatedEvents, this, [root]);
                this.lastDelegates[entityId] = delegatedEvents;
            }
        },

        /** @private */
        drawDependentEntities: function (entityId) {
            var renderCfg = this.entities.getComponentData(entityId, 'vdom');
            if (!renderCfg) {
                return;
            }

            var childRoot = document.getElementById(entityId);
            if (childRoot && childRoot !== renderCfg.root) {
                this.entities.setComponent(entityId, 'vdom', {
                    root: childRoot,
                    lastTree: h(), // clear cache to force re-draw
                });
                this.draw(renderCfg, entityId);
            }
        },

        /** @private */
        delegatedEvents: function (cfg, key, node) {
            if (cfg.selector) {
                node = node.querySelector(cfg.selector);
            }

            this.delegator.delegateKey(cfg.event, cfg.delegate, node);
        },

    }).whenBrewed(function () {
        this.lastStates = {};
        this.lastDelegates = {};
    });
}());
