'use strict';

var Inferno = require('inferno');
var VNodeFlags = require('inferno-vnode-flags');

exports.div = function (attributes) {
    var className = '';
    var props = {};

    for (var i = 0, l = attributes.length; i < l; i++) {
        var key = attributes[i][0];
        var val = attributes[i][1];

        if (key === 'className') {
            className = val;
        } else {
            props[key] = val;
        }
    }

    return function (childNodes) {
        return Inferno.createVNode(VNodeFlags.HtmlElement, 'div', className, childNodes, props);
    };
};

exports.text = function (text) {
    return Inferno.createVNode(VNodeFlags.Text, '', '', text);
};

exports.render = function (vdom) {
    return function () {
        var root = document.querySelector(vdom.root);
        if (!root) {
            return;
        }

        Inferno.render(vdom.vnode, root);
    };
};
