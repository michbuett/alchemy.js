exports.unsafeHandler = function (eventName) {
  return function (fn) {
    return function (node) {
      return function () {
        var handler = function (e) {
          fn(e)()
        }

        var unsubscribe = function () {
          node.removeEventHandler(eventName, handler)
        }

        node.addEventHandler(eventName, handler)

        return unsubscribe
      }
    }
  }
}
