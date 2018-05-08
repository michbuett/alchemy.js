'use strict'

exports.render = function (rootSelector) {
  return function (dom) {
    return function () { // Eff (Stream (Eff ...))
      var updates
      var unit = {}

      function updateDOM() {
        if (!updates) {
          var root = document.querySelector(rootSelector)
          if (root) {
            var elem = dom(root)()
            updates = elem.updates

            window.addEventListener('unload', function () {
              elem.remove()
            })
          }
        }

        if (updates && updates.length > 0) {
          // console.time('update DOM')
          for (var i = 0, l = updates.length; i < l; i++) {
            updates[i]()
          }
          // console.timeEnd('update DOM')
        }

        return unit
      }

      return function () { // Stream ( Eff ...)
        return updateDOM
      }
    }
  }
}
