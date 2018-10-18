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

exports.unsafeShow = function (o) {
  // TODO find way to use show typeclass
  return JSON.stringify(o, null, '  ')
}

exports.unsafeEq = function (o1) {
  return function (o2) {
    // TODO find way to use eq typeclass
    return o1 === o2 || JSON.stringify(o1) === JSON.stringify(o2)
  }
}
