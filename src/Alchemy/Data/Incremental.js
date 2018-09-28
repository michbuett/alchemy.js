exports.unsafePatchRecord = function unsafePatchRecord(r) {
  return function (changes) {
    var target = {}
    var keys = Object.keys(r)

    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i]
      var val = r[key]
      var change = changes[key]

      if (change) {
        target[key] = val.patch(change)
      } else {
        target[key] = val
      }
    }

    return {
      value: target,
      patch: unsafePatchRecord(target)
    }
  }
}

exports.unsafeUpdateAt = function (i) {
  return function (delta) {
    return function (a) {
      var result = [].concat(a)
      result[i] = result[i].patch(delta)
      return result
    }
  }
}

exports.unsafeInsertAt = function (i) {
  return function (v) {
    return function (a) {
      var result = [].concat(a)
      result.splice(i, 0, v)
      return result
    }
  }
}

exports.unsafeDeleteAt = function (i) {
  return function (a) {
    var result = [].concat(a)
    result.splice(i, 1)
    return result
  }
}
