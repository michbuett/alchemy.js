exports.unsafePatchRecord = function (changes) {
  return function (r) {
    var target = {}
    var keys = Object.keys(r)

    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i]
      var val = r[key]
      var change = changes[key]

      if (change) {
        target[key] = change.patch(val)
      } else {
        target[key] = val
      }
    }

    return target
  }
}

exports.cloneArray = function (a) {
  return [].concat(a)
}

exports.unsafeUpdateAt = function (i) {
  return function (patchFn) {
    return function (a) {
      a[i] = patchFn(a[i])
      return a
    }
  }
}

exports.unsafeInsertAt = function (i) {
  return function (v) {
    return function (a) {
      a.splice(i, 0, v)
      return a
    }
  }
}

exports.unsafeDeleteAt = function (i) {
  return function (a) {
    a.splice(i, 1)
    return a
  }
}
