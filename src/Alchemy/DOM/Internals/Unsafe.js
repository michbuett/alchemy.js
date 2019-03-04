exports.unsafeSetAttr = function (name) {
  return function (node) {
    return function (val) {
      return function () {
        if (val === false) {
          node.removeAttribute(name)
        } else if (val === true) {
          node.setAttribute(name, name)
        } else {
          node.setAttribute(name, val)
        }
      }
    }
  }
}

exports.unsafeSetObjectProperty = function (key) {
  return function (obj) {
    return function (val) {
      return function () {
        obj[key] = val
      }
    }
  }
}

exports.appendChild = function (parent) {
  return function (child) {
    return function () {
      parent.appendChild(child)
    }
  }
}

exports.removeChild = function (parent) {
  return function (child) {
    return function () {
      parent.removeChild(child)
    }
  }
}

exports.createElement = function (tagname) {
  return function () {
    return document.createElement(tagname)
  }
}

exports.createTextNode = function (txt) {
  return function () {
    return document.createTextNode(txt)
  }
}

exports.unsafeHandler = function (eventName) {
  return function (fn) {
    return function (node) {
      return function () {
        var handler = function (e) {
          fn(e)()
        }

        node.addEventHandler(eventName, handler)

        return function removeEventHandler() {
          node.removeEventHandler(eventName, handler)
        }
      }
    }
  }
}

exports.querySelectorImpl = function (Nothing) {
  return function (Just) {
    return function (sel) {
      return function () {
        var n = document.querySelector(sel)
        if (n) {
          return Just(n)
        } else {
          return Nothing
        }
      }
    }
  }
}
