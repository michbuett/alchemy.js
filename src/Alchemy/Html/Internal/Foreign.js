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

exports.unsafeAddEventHandler = function (eventName) {
  return function (fn) {
    return function (node) {
      return function () {
        console.log('[DEBUG] addEventHandler', eventName, fn, node)
        var handler = function (e) {
          console.log('[DEBUG] event "' + eventName + '": ', e)
          fn(e)()
        }

        node.addEventListener(eventName, handler)

        return function removeEventHandler() {
          node.removeEvenListener(eventName, handler)
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

exports.getTag = function (x) {
  if (typeof x === 'number') {
    if (x === Math.floor(x)) {
      return 'int'
    } else {
      return 'number'
    }
  }

  if (typeof x === 'string') {
    return 'string'
  }

  if (x === null) {
    return 'null'
  }

  if (x === undefined) {
    return 'undefined'
  }

  if (Array.isArray(x)) {
    return 'array'
  }

  if (typeof x === 'object') {
    return 'object'
  }

  return 'unknown'
}
