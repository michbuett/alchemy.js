exports.together = function (consumerArr) {
  return function () {
    var unsubs = consumerArr.map(function (consume) {
      return consume()
    })

    return function () {
      unsubs.forEach(function (unsub) {
        unsub()
      })
    }
  }
}
