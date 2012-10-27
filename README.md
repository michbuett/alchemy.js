alchemy.js
==========

Yet another javascript framework - but one to be afraid of!

Features
========

* It is prototype based. alchemy.js is working with prototypes as it was meant to be for Javascript. There is no Class, Klass, Clazz or anything unnatural like that. You can create instances of a prototype using a factory pattern, e.g.
```js
var myIntance = MyType.create({
  cfg1: 'foo',
  cfg2: 'bar',
  ...
});
```
* It provides a convenient super reference. Every method that overrides another one has access to a local variable ``_super}
* It is really platform independent. It is tested to work with node.js and in a (good) browser.
* Mixins