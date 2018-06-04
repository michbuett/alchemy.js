var pixi = require('pixi.js')

exports.render = function (options) {
  return function (selector) {
    return function (graphic) {
      return function mountGraphicsRoot() {
        if (window.devicePixelRatio >= 0) {
          options.resolution = window.devicePixelRatio
        }

        var app = new pixi.Application(options)
        app.view.style.width = options.width + 'px'
        app.view.style.height = options.height + 'px'

        var node = document.querySelector(selector)
        node.appendChild(app.view)

        var removeGraphic = graphic(app.stage)()

        return function removeGraphicsRoot() {
          node.removeChild(app.view)
          removeGraphic()
        }
      }
    }
  }
}
