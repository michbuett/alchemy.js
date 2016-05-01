module.exports = (function () {
    'use strict';

    var h = require('virtual-dom/h');
    var diff = require('virtual-dom/diff');
    var patch = require('virtual-dom/patch');

    var coquoVenenum = require('coquo-venenum');
    var each = require('pro-singulis');

    var utils = require('./Utils');

    /**
     * @class
     * @name RenderContext
     */
    function RenderContext(id, state, props, children) {

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
    RenderContext.prototype.renderChild = function renderChild(entityId) {
        return h('div', {id: entityId, key: entityId});
    };

    /**
     * Renderes all available child entites
     *
     * @return array An array of virtual dom nodes
     */
    RenderContext.prototype.renderAllChildren = function renderAllChildren() {
        return each(utils.values(this.children), this.renderChild, this) || [];
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
         * The previous application state
         *
         * @property appState
         * @type Immutablis
         * @private
         */
        lastAppState: undefined,

        /**
         * Updates the component system (updates dom depending on the current
         * state of the entities)
         * @param Immutablis state The current application state
         */
        update: function (state) {
            if (state === this.lastAppState) {
                return;
            }

            var renderConfigs = this.entities.getAllComponentsOfType('vdom');
            each(renderConfigs, this.updateEntity, this, [state]);

            this.lastAppState = state;
        },

        /** @private */
        updateEntity: function (cfg, entityId, appState) {
            var root = cfg.root || document.getElementById(entityId);
            if (!root) {
                return;
            }

            var state = this.mapState(cfg.stateMap, appState);
            if (state === this.lastStates[entityId]) {
                return;
            }

            var children = this.entities.getComponentData(entityId, 'children');
            var context = new RenderContext(entityId, state, cfg.props, children, {});
            var lastTree = cfg.currentTree || h();
            var currentTree = cfg.renderer(context);

            this.lastStates[entityId] = state;

            root = this.draw(root, lastTree, currentTree);

            this.entities.setComponent(entityId, 'vdom', {
                currentTree: currentTree,
                lastTree: lastTree,
                root: root,
            });

            each(children, this.updateChildEntity, this);
        },

        /** @private */
        updateChildEntity: function (id, key, appState) {
           var cfg = this.entities.getComponentData(id, 'vdom');
           this.updateEntity(cfg, id, appState);
        },

        /** @private */
        draw: function (root, lastTree, currentTree) {
            var patches = diff(lastTree, currentTree);
            return patch(root, patches);
        },

        /** @private */
        mapState: function (stateMap, appState) {
            if (stateMap && typeof stateMap === 'function') {
                return stateMap(appState);
            }

            return appState;
        },


    }).whenBrewed(function () {
        this.lastStates = {};
    });
}());
