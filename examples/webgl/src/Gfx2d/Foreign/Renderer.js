exports.initRendererImpl = function (cfg) {
  return function () {
    var canvas = createCanvas(cfg)
    var parent = document.querySelector(cfg.selector)
    var graphics = []

    parent.appendChild(canvas)

    setupRenderLoop(graphics)

    return {
      graphics: graphics,
      canvas: canvas,
      gl: canvas.getContext('webgl')
    }
  }
}

exports.refreshRenderResultImpl = function (ctxt) {
  return function () {
    for (var i = 0, l = ctxt.graphics.length; i < l; i++) {
      ctxt.graphics[i](ctxt.gl)
    }
  }
}

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
// PRIVATE HELPER

function createCanvas(cfg) {
  var canvas = document.createElement('canvas')
  var scale = window.devicePixelRatio || 1
  canvas.width = cfg.width * scale
  canvas.height = cfg.height * scale
  canvas.style.width = cfg.width + 'px'
  canvas.style.height = cfg.height + 'px'
  return canvas
}

function setupRenderLoop(graphics) {
  function loop(now) {
    for (var i = 0, l = graphics.length; i < l; i++) {
      graphics[i]()
    }
    window.requestAnimationFrame(loop)
  }

  window.requestAnimationFrame(loop)
}
