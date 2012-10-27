alchemy.js
==========

Yet another javascript framework - but one to be afraid of!

Prototypes
----------

Yes, it is prototype based. There is no Class, Klass, Clazz or anything unnatural like that. alchemy.js is working with prototypes (or potions - the alchemy.js term) as it was meant to be for Javascript. You can define new potions with   

```js
alchemy.addFormula({
  name: 'MyType',
  extend: 'SomeSuperType',
  overrides: {
    // custom properties and methods
    ...
  }
});
```
After that you can access the new potion using `alchemy('MyType')`. The object is created in the moment of the first access so the order of the declaration does not matter, i.e you can define `MyType` before defining `SomeSuperType`. 
To avoid conflicts with other frameworks alchemy.js does not alter native objects so every potion extends `core.MateriaPrima`.

It also provides a convenient super reference. Every method that overrides another one has access to a local variable `_super` which referce to the overridden method. For Example:

```js
alchemy.addFormula({
  name: 'MyType',
  extend: 'SomeSuperType',
  overrides: {
    foo: function () {      
      return 'foo'
    }
  }
});
```

You can create instances of a prototype using a factory pattern, e.g.

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