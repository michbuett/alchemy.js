exports.unsafeUpdateAt = function (i) {
  return function (delta) {
    return function (a) {
      var result = [].concat(a)
      var increment = result[i].patch(delta)
      result[i] = increment.new
      // console.log('[unsafeUpdateAt]', i, delta, a)
      return {
        result: result,
        applied: increment.delta
      }
    }
  }
}

exports.unsafeInsertAt = function (i) {
  return function (v) {
    return function (a) {
      var result = [].concat(a)
      result.splice(i, 0, v)
      // console.log('[unsafeInsertAt]', i, v, a)
      return result
    }
  }
}

exports.unsafeDeleteAt = function (i) {
  return function (a) {
    var result = [].concat(a)
    result.splice(i, 1)
    // console.log('[unsafeDeleteAt]', i, a)
    return result
  }
}
