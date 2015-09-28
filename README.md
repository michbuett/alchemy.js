# alchemy.js
[![Build Status](https://travis-ci.org/michbuett/alchemy.js.svg?branch=master)](https://travis-ci.org/michbuett/alchemy.js)
[![Coverage Status](https://coveralls.io/repos/michbuett/alchemy.js/badge.svg?branch=master&service=github)](https://coveralls.io/github/michbuett/alchemy.js?branch=master)
[![npm version](https://badge.fury.io/js/alchemy.js.svg)](http://badge.fury.io/js/alchemy.js)

> “Medicine, and Law, and Philosophy -
You've worked your way through every school,
Even, God help you, Theology,
And sweated at it like a fool.
Why labour at it any more?
You're no wiser now than you were before.
...
A dog could stand this life no more.
And so I've turned to magic lore;
The spirit message of this art
Some secret knowledge might impart.
No longer shall I sweat to teach
What always lay beyond my reach;
I'll know what makes the world revolve,
Its mysteries resolve,
No more in empty words I'll deal -
Creation's wellsprings I'll reveal!”
  ― Johann Wolfgang von Goethe, Faust: First Part

This is the framework for every ambitious young developer who wants to master the occult arts of Javascript.
Well, it is going to be. First and foremost it is a playgound where I can test my ideas and where I hone my developer skills.

So far it provides (among other things):
- An easy and flexible event system
- A simple yet very powerful type system: [coquo-venenum](https://github.com/michbuett/coquo-venenum)
- Immutable data structures: [immutabilis](https://github.com/michbuett/immutabilis)
- Component systems for DOM updates, CSS creation and event delegation

## How can I get it?
It is available at [npm](https://www.npmjs.com/package/alchemy.js)
```
npm install alchemy.js
```

## How do I use it?
You can take look at the examples:
- [todo-ecs](https://github.com/michbuett/todo-ecs) - The [TodoMVC](http://todomvc.com/) application built using an [Entity-Component-System](http://entity-systems.wikidot.com/)
- [alchemy-todo](https://github.com/michbuett/alchemy-todo) - A more tradional, MVC-based approach that also features some FRP mechanisms

It uses the CommonJS module syntax so you can use the modules directly in any NodeJS environment or [browserify](http://browserify.org/) for applications running in a browser. Additionally you can utilize [this module loader](https://github.com/michbuett/node-module-loader) for an easier development/debugging cycle.

However, please be aware that its purpose is to unravel the mysteries of development, not to power any production environment - not yet. You are messing with dark powers. Don't complain when your application is haunted - but feel free to file an issue.

## What's the deal with the naming?
It is ...
- 5%  - All the good names where taken and I had to pick something?
- 10% - Philosophy (thinking the unthinkable, to "... know what makes the world revolve")
- 85% - Nerdy bullshit (no excuses)

## And the license?
The software is released under the [Don't-be-evil-license](http://www.json.org/license.html) (or JSON-license) of Douglas Crockford. There is to much evil in this world already...
