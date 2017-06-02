'use strict';

var Inferno = require('inferno');
var VNodeFlags = require('inferno-vnode-flags');

exports.div = function (attributes) {
    var className = '';
    var props = {};

    for (var i = 0, l = attributes.length; i < l; i++) {
        var split = attributes[i].split('=');
        var key = split[0].trim();
        var val = split[1].trim();

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

exports.render = function (selector) {
    return function (vNode) {
        return function () {
            Inferno.render(vNode, document.querySelector(selector));
        };
    };
};
