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
