exports.arrayImpl = function (map, createGraphic, rvArray) {
  return function (resource) { // Graphic (Resource → Subscription)
    return function mountGraphicsList() {
      var children = []

      // subscribe to updates of the data array
      var unsubArr = rvArray(function (arr) {
        var newLength = arr.length
        while (children.length < newLength) {
          var s = createRValFromIndex(map, rvArray, children.length)
          var g = createGraphic(s)
          children.push(g(resource)())
        }

        while (children.length > newLength) {
          children.pop()()
        }
      })

      return function removeGraphicsList() {
        unsubArr()
        while (children.length > 0) {
          children.pop().remove()
        }
      }
    }
  }
}

// little helper :: Array (RV a) -> Int -> RV a
function createRValFromIndex(map, rvArray, i) {
  return map(function (arr) {
    return arr[i]
  })(rvArray)
}

exports.box = function (graphics) {
  return function (resource) {
    return function mountBox() {
      var onRemove = graphics.map(function (g) {
        return g(resource)()
      })

      return function removeBox() {
        while (onRemove.length > 0) {
          onRemove.pop().remove()
        }
      }
    }
  }
}

exports.zlayer = function () {
  // TODO implement me
}
