exports.together = function (consumerArr) {
  return function () {
    var unsubs = consumerArr.map(function (consume) {
      return consume()
    })

    return function () {
      // console.trace()
      unsubs.forEach(function (unsub) {
        unsub()
      })
    }
  }
}

exports.switcher = function (createSink) {
  return function (event) {
    return function (initialVal) {
      return function () {
        var unsubS = createSink(initialVal)()
        var unsubE = event.subscribe(function (val) {
          unsubS()
          unsubS = createSink(val)()
        })

        return function () {
          unsubE()
          unsubS()
        }
      }
    }
  }
}
