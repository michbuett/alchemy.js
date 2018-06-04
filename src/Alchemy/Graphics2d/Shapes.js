var pixi = require('pixi.js')

exports.circle = createShape(function drawCircle(props) {
  var g = new pixi.Graphics()
  g.beginFill(props.fillColor)
  g.drawCircle(0, 0, props.radius)
  g.endFill()

  return applyProps(new pixi.Sprite(g.generateCanvasTexture()), props)
})

exports.rect = createShape(function drawCircle(props) {
  var g = new pixi.Graphics()
  g.beginFill(props.fillColor)
  g.drawRect(0, 0, props.width, props.height)
  g.endFill()

  return applyProps(new pixi.Sprite(g.generateCanvasTexture()), props)
})

function createShape(drawFn) {
  return function (props) {
    return function (attr) {
      return function (parentResource) {
        return function () {
          var resource = drawFn(props)
          var onRemove = attr.map(function (a) {
            return a(resource)()
          })

          parentResource.addChild(resource)

          return function removeShape() {
            for (var i = 0, l = onRemove.length; i < l; i++) {
              onRemove[i]()
            }
            parentResource.removeChild(resource)
          }
        }
      }
    }
  }
}

function applyProps(s, props) {
  s.x = props.xpos
  s.y = props.ypos
  s.alpha = props.alpha
  return s
}
