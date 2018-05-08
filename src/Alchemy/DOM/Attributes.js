function setAttribute(node, name, value) {
  if (value === false) {
    node.removeAttribute(name)
  } else if (value === true) {
    node.setAttribute(name, name)
  } else {
    node.setAttribute(name, value)
  }
}

exports.staticAttr = function (name) {
  return function (value) {
    return function (node) {
      return function () {
        setAttribute(node, name, value)
        return []
      }
    }
  }
}

exports.dynamicAttr = function (name) {
  return function (valueStream) {
    return function (node) {
      return function () {
        var currVal
        var update = function () {
          var newVal = valueStream()

          if (newVal === currVal) {
            return
          }

          setAttribute(node, name, newVal)
          currVal = newVal
        }

        update()

        return [update]
      }
    }
  }
}
