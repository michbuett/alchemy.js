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

exports.text = function (text) {
  return function (parentNode) {
    return function () {
      var textNode = document.createTextNode('')
      var unsub = text(function (newText) {
        textNode.textContent = newText
      })

      parentNode.appendChild(textNode)

      return function () {
        unsub()
        parentNode.removeChild(textNode)
      }
    }
  }
}
