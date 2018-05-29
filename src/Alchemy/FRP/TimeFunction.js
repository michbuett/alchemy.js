exports.fromVal = function (val) {
  return function () {
    return val
  }
}

exports.fromChannel = function (channel) {
  return function (initialVal) {
    var val = initialVal

    channel.subscribe(function (newVal) {
      val = newVal
    })

    return function () {
      return val
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

// exports.switcher = function (tf) {
//   return function (ch) {
//     var getVal = tf
//
//     ch.subscribe(function (newTf) {
//       getVal = newTf
//     })
//
//     return function () {
//       getVal()
//     }
//   }
// }
