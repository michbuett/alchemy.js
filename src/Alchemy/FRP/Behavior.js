exports.pureImpl = function (val) {
  return function () {
    return val
  }
}

exports.mapImpl = function (fn) {
  return function (s) {
    return function () {
      return fn(s())
    }
  }
}

exports.applyImpl = function (sf) {
  return function (sa) {
    return function () {
      return sf()(sa())
    }
  }
}

exports.sample = function (tf) {
  return function (event) {
    return function (handler) {
      return event(function () {
        handler(tf())
      })
    }
  }
}

exports.sampleBy = function (tf) {
  return function (event) {
    return function (handler) {
      return event(function (newVal) {
        handler(tf()(newVal))
      })
    }
  }
}
