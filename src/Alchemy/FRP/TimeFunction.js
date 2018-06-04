exports.constantTF = function (val) {
  return function () {
    return val
  }
}

exports.createTF = function (initialVal) {
  return function () {
    var currVal = initialVal

    return {
      tf: function () {
        return currVal
      },

      setValue: function (newVal) {
        return function () {
          currVal = newVal
        }
      }
    }
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

exports.sampleRV = function (tf) {
  return function (channel) {
    return function (handler) {
      handler(tf())
      return channel.subscribe(function () {
        handler(tf())
      })
    }
  }
}

exports.sampleRVBy = function (tf) {
  return function (channel) {
    return function (initialVal) {
      return function (handler) {
        handler(tf()(initialVal))
        return channel.subscribe(function (newVal) {
          handler(tf()(newVal))
        })
      }
    }
  }
}
