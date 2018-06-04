exports.unsafeAttr = function (name) {
  return function (rv) {
    return function (node) {
      return function () {
        return rv(function (value) {
          if (value === false) {
            node.removeAttribute(name)
          } else if (value === true) {
            node.setAttribute(name, name)
          } else {
            node.setAttribute(name, value)
          }
        })
      }
    }
  }
}
