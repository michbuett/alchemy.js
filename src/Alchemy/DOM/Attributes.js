exports.unsafeAttr = function (name) {
  return function (rv) {
    return function (node) {
      return function () {
        var lastVal

        return rv(function (newVal) {
          if (newVal === lastVal) {
            return
          }

          if (newVal === false) {
            node.removeAttribute(name)
          } else if (newVal === true) {
            node.setAttribute(name, name)
          } else {
            node.setAttribute(name, newVal)
          }
          lastVal = newVal
        })
      }
    }
  }
}
