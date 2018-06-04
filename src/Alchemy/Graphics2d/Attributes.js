var unit = {}

exports.pos = function (rv) {
  return function (obj) {
    return function () {
      return rv(function updatePos2d(values) {
        obj.x = values.x
        obj.y = values.y
        return unit
      })
    }
  }
}
