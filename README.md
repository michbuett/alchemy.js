alchemy.js
==========
It is the framework for every ambitious young developer who wants to master the occult arts of Javascript.
Well, it is going to be. First of all it is a playgound where I can test my ideas and where I can improve my 
programmer skills. 

So far I was able to come up with:
* ... an advanced type system, incuding mixins and a convenient way to call an overridden method
* ... a module system that works in a browser and with node.js
* ... an easy, powerful and blazing fast templating mechanism
* ... and an event system which is - in my opinion - even more powerful than the one of jQuery or Underscore.js

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
  overrides: {
    foo: function () {      
      return 'foo';
    }
  }
});

alchemy.addFormula({
  name: 'MySubType',
  extend: 'MyType',
  overrides: {
    foo: function () {      
      return _super.call(this) + ' - bar';
    }
  }
});

alchemy('MySubType').foo() // returns "foo - bar"
```

You can create instances of a prototype using a factory pattern, e.g.

```js
var myIntance = MyType.create({
  cfg1: 'foo',
  cfg2: 'bar',
  ...
});
```

In contrast to the native `Object.create` the arguments are passed to the constructor method of a new potion instance.


Mixins
------
_coming soon_

Events
------
_coming soon_