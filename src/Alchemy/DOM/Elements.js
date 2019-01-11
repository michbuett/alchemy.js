exports.elementImpl = function (tag, attributes, handler, children) {
  return function (parentNode) { // DOM (Node → Eff { updates, remove })
    return function () { // Eff { ... }
      var node = document.createElement(tag)
      var onRemove =
        attributes
          .concat(handler)
          .concat(children)
          .map(function (fn) { return fn(node)() })

      parentNode.appendChild(node)

      return function removeElement() {
        for (var i = 0, l = onRemove.length; i < l; i++) {
          onRemove[i]()
        }
        parentNode.removeChild(node)
      }
    }
  }
}

exports.arrayImpl = function (tag, attributes, createChildFn, arrayStream) {
  return function (parentNode) {
    return function () {
      throw new Error('TODO: Implement Me!')
    }
  }
}

exports.text = function (observableTxt) {
  return function (parentNode) {
    return function () {
      var text = observableTxt.value()
      var textNode = document.createTextNode(text)
      var unsub = observableTxt.increments(function (i) {
        textNode.textContent = i.new
      })

      parentNode.appendChild(textNode)

      return function () {
        unsub()
        parentNode.removeChild(textNode)
      }
    }
  }
}
//
// exports.appendChild = function (parent) {
//   return function (child) {
//     return function () {
//       parent.appendChild(child)
//     }
//   }
// }
//
// exports.removeChild = function (parent) {
//   return function (child) {
//     return function () {
//       parent.removeChild(child)
//     }
//   }
// }
//
// exports.createElement = function (tagname) {
//   return function () {
//     document.createElement(tagname)
//   }
// }
//
// exports.createTextNode = function (txt) {
//   return function () {
//     return document.createTextNode(txt)
//   }
// }
