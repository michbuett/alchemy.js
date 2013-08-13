(function () {
    'use strict';

    var alchemy = require('./alchemy.js');

    /**
     * credit to ippa for his javascrip game engine (http://jawsjs.com/)
     *
     * @class
     * @name alchemy.browser.Resources
     * @extends alchemy.core.Oculus
     * @requires alchemy.core.Collectum
     * @requires alchemy.browser.SpriteSheet
     */
    alchemy.formula.add({
        name: 'alchemy.browser.Resources',
        alias: 'Resources',
        extend: 'alchemy.core.Oculus',

        requires: [
            'alchemy.core.Collectum',
            'alchemy.browser.SpriteSheet'
        ],

        overrides: {
            /** @lends alchemy.browser.Resources.prototype */

            /**
             * The known resources
             * @property resources
             * @type {alchemy.core.Collectum}
             */
            resources: undefined,

            /**
             * The root path where the resources can be found
             * @property root
             * @type {String}
             */
            root: '',

            /**
             * A mapping file extension -> resource type
             * @property fileTypes
             * @type {Object}
             */
            fileTypes: {
                json: 'json',
                wav: 'audio',
                ogg: 'audio',
                png: 'image',
                jpg: 'image',
                jpeg: 'image',
                gif: 'image',
                bmp: 'image',
                tiff: 'image',
                mp3: 'audio'
            },

            init: function () {
                this.resources = alchemy('Collectum').brew();
            },

            /**
             * Get one resource which has been loaded
             *
             * @param {String} id The resource identifier
             *
             * @return {Object}
             *      the resource object
             */
            get: function (id) {
                if (this.isLoaded(id)) {
                    return this.resources.get(id).data;
                } else {
                    return null;
                }
            },

            /**
             * Return <code>true</code> if src is in the process of loading
             * (but not finished yet)
             *
             * @param {String} id The resource identifier
             *
             * @return {Boolean}
             */
            isLoading: function (id) {
                var res = this.resources.get(id);
                return res && res.status === 'loading';
            },

            /**
             * Return <code>true</code> if src has been loaded completely
             *
             * @param {String} id The resource identifier
             *
             * @return {Boolean}
             */
            isLoaded: function (id) {
                var res = this.resources.get(id);
                return res && res.status === 'success';
            },

            /**
             * Adds one or more resource definition which can be later loaded
             * using {@link arena.alchemy.Resources#loadAll}
             *
             * @param {Object/Array} cfg The resource definition object or an array of those objects
             * @param {String} cfg.id The resource identifier
             * @param {String} cfg.src The source URL
             * @param {String} cfg.type Optional; The resource type (will be determined by the src if omitted)
             * @param {Function} cfg.success Optional; The callback when the resource was loaded successfully
             * @param {Function} cfg.error Optional; The callback when loading the resource failed
             * @param {Object} cfg.scope Optional; The execution context for the callbacks
             *
             * @example
             * resources.define({id: 'my-sprite', src: 'images/sprite.png', success: onLoadCallback});
             * resources.define([{id: 'sprite1', src: 'images/sprite1.png'}, {id: 'sprite2, src: 'images/sprite2.png'}]);
             * resources.loadAll({finished: start_game});
             */
            define: function (cfg) {
                if (!cfg) {
                    return;
                }

                if (alchemy.isArray(cfg)) {
                    alchemy.each(cfg, this.define, this);
                    return;
                }

                this.resources.add(alchemy.mix({
                    status: 'waiting',
                    type: this.getType(cfg.src)
                }, cfg));

                return this.resources.at(-1);
            },

            /** Load all pre-specified resources */
            loadAll: function (options) {
                this.successCount = 0;
                this.failureCount = 0;

                if (this.resources.length > 0) {
                    this.resources.each(function (resource) {
                        this.load(resource, options);
                    }, this);
                } else {
                    // we are already done -> trigger callback
                    if (options && options.finished) {
                        options.finished.call(options.scope, options);
                    }
                }
            },

            /** Load one resource-object, i.e: {src: "foo.png"} */
            load: function (resource, options) {
                if (alchemy.isString(resource)) {
                    resource = this.get(resource);
                }
                if (!alchemy.isObject(resource)) {
                    return;
                }
                if (!this.resources.contains(resource)) {
                    resource = this.define(resource);
                }
                if (this.isLoaded(resource)) {
                    this.loadSuccess(resource, options);
                    return;
                }

                var srcUrl = this.root + resource.src + "?" + alchemy.random(10000000);
                var successCb = this.loadSuccess.bind(this, resource, options);
                var failureCB = this.loadFailure.bind(this, resource, options);
                var data;

                switch (resource.type) {
                case 'spritesheet':
                case 'image':
                    data = new Image();
                    data.onload = successCb;
                    data.onerror = failureCB;
                    data.src = srcUrl;
                    break;

                case 'audio':
                    throw 'unsupported file type: AUDIO';

                default:
                    data = new XMLHttpRequest();
                    data.onload = successCb;
                    data.onerror = failureCB;
                    data.open('GET', srcUrl, true);
                    data.send(null);
                    break;
                }

                alchemy.mix(resource, {
                    status: 'loading',
                    data: data
                });
            },


            //
            //
            // private helper methods
            //
            //

            /**
             * Helper method to determine the resource type based on the source URL
             * @private
             */
            getType: function (src) {
                var postfix = (/\.([a-zA-Z0-9]+)$/.exec(src)[1]).toLowerCase();
                return this.fileTypes[postfix] || 'default';
            },

            /**
             * Callback for all resource-loading.
             * @private
             */
            loadSuccess: function (resource, options) {
                var type = resource.type.toLowerCase();

                // update status
                resource.status = 'success';

                // Process data depending differently on postfix
                switch (type) {
                case 'image':
                    // convert the image into a canvas because they are easier
                    // to modify later
                    var img = resource.data;
                    var cxt, cvs = document.createElement('canvas');
                    // draw the image to the canvas
                    cvs.width = img.width;
                    cvs.height = img.height;
                    cxt = cvs.getContext('2d');
                    cxt.drawImage(img, 0, 0);
                    // write the data back
                    resource.data = cvs;
                    break;

                case 'spritesheet':
                    resource.data = alchemy('SpriteSheet').brew(alchemy.mix({
                        image: resource.data
                    }, resource));
                    break;

                case 'json':
                    if (!resource.data || resource.data.readyState !== 4) {
                        return;
                    }
                    resource.data = JSON.parse(resource.data.responseText);
                    break;

                case 'audio':
                    //resource.data.removeEventListener("canplay", ?, false);
                    break;

                default:
                    resource.data = resource.data.responseText;
                }

                this.successCount++;
                this.processCallbacks(resource, true, options);
            },

            /** @private */
            loadFailure: function (resource, options) {
                this.failureCount++;
                this.processCallbacks(resource, false, options);
            },

            /** @private */
            processCallbacks: function (resource, success, options) {
                var percent = Math.round((this.successCount + this.failureCount) / this.resources.length * 100);

                if (success) {
                    if (resource.success) {
                        resource.success.call(resource.scope, resource);
                    }
                    if (options && options.success) {
                        options.success.call(options.scope, resource, percent, options);
                    }
                } else {
                    if (resource.failure) {
                        resource.failure.call(resource.scope);
                    }
                    if (options && options.failure) {
                        options.failure.call(options.scope, resource, percent, options);
                    }
                }

                if (percent >= 100) {
                    // When loadAll() is 100%, then call the final callback
                    if (options && options.finished) {
                        options.finished.call(options.scope, options);
                    }
                }
            }
        }
    });
}());

