var pixi = require('pixi.js')

exports.circle = function (radius) {
  return function (props) {
    return function (attr) {
      return createGraphic(function drawCircle() {
        return draw(props, function (g) {
          g.drawCircle(0, 0, radius)
        })
      }, attr)
    }
  }
}

exports.rect = function (width) {
  return function (height) {
    return function (props) {
      return function (attr) {
        return createGraphic(function drawRect() {
          return draw(props, function (g) {
            g.drawRect(0, 0, width, height)
          })
        }, attr)
      }
    }
  }
}

exports.text = function (txt) {
  return function (style) {
    return function (props) {
      return function (attr) {
        return createGraphic(function drawText() {
          return applyProps(new pixi.Text(txt, style), props)
        }, attr)
      }
    }
  }
}

// ////////////////////////////////////////////////
// PRIVATE HELPER

function draw(props, drawFn) {
  var g = new pixi.Graphics()

  g.beginFill(props.fillColor)
  g.lineStyle(props.lineWidth, props.lineColor, props.lineAlpha)
  drawFn(g)
  g.endFill()

  return toSprite(g, props)
}

function createGraphic(createResource, attr) {
  return function (parentResource) {
    return function () {
      var resource = createResource()
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

function toSprite(graphic, props) {
  return applyProps(
    new pixi.Sprite(graphic.generateCanvasTexture()),
    props
  )
}

function applyProps(s, props) {
  s.x = props.xpos
  s.y = props.ypos
  s.alpha = props.alpha
  s.interactive = false

  return s
}
