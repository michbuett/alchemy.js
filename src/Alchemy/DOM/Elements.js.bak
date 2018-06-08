exports.elementImpl = function (tag, attributes, handler, children) {
  return function (parentNode) { // DOM (Node → Eff { updates, remove })
    return function () { // Eff { ... }
      var i, l
      var node = document.createElement(tag)
      var updates = []
      var onRemove = []

      for (i = 0, l = attributes.length; i < l; i++) {
        updates = updates.concat(attributes[i](node)())
      }

      for (i = 0, l = handler.length; i < l; i++) {
        onRemove.push(handler[i](node)())
      }

      for (i = 0, l = children.length; i < l; i++) {
        var child = children[i](node)()
        updates = updates.concat(child.updates)
        onRemove.push(child.remove)
      }

      var removeFn = function removeElement() {
        for (var i = 0, l = onRemove.length; i < l; i++) {
          onRemove[i]()
        }
        parentNode.removeChild(node)
      }

      parentNode.appendChild(node)

      return {
        updates: updates,
        remove: removeFn
      }
    }
  }
}

exports.arrayImpl = function (tag, attributes, createChildFn, arrayStream) {
  return function (parentNode) {
    return function () {
    }
  }
}

exports.textS = function (textStream) {
  return function (parentNode) {
    return function () {
      var currText = textStream()
      var textNode = document.createTextNode(currText)

      parentNode.appendChild(textNode)

      return {
        updates: [function updateDynamicText() {
          var newText = textStream()
          if (newText === currText) {
            return
          }

          textNode.textContent = newText
          currText = newText
        }],

        remove: function removeDynamicText() {
          parentNode.removeChild(textNode)
        }
      }
    }
  }
}

exports.text = function (text) {
  return function (parentNode) {
    return function () {
      var textNode = document.createTextNode(text)
      parentNode.appendChild(textNode)

      return {
        updates: [],
        remove: function removeStaticText() {
          parentNode.removeChild(textNode)
        }
      }
    }
  }
}
