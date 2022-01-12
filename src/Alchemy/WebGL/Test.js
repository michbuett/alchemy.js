'use strict'

// relative to "output/Alchemy.WebGL.Test/"
var sprite = require('../../src/Alchemy/WebGL/Foreign/shader/sprite2d.js')

exports.run = function () {
  main()
}

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById('canvas')
  var gl = canvas.getContext('webgl')
  if (!gl) {
    return
  }

  // setup GLSL program
  // var program = createProgramFromScripts(gl, ['drawImage-vertex-shader', 'drawImage-fragment-shader'])
  var program = sprite.createProgram(gl)

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, 'a_position')
  var texcoordLocation = gl.getAttribLocation(program, 'a_texcoord')

  // lookup uniforms
  var matrixLocation = gl.getUniformLocation(program, 'u_matrix')
  var textureLocation = gl.getUniformLocation(program, 'u_texture')

  // Create a buffer.
  var positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)

  // Put a unit quad in the buffer
  var positions = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

  // Create a buffer for texture coords
  var texcoordBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)

  // Put texcoords in the buffer
  var texcoords = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1
  ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW)

  // creates a texture info { width: w, height: h, texture: tex }
  // The texture will start with 1x1 pixels and be updated
  // when the image has loaded
  function loadImageAndCreateTextureInfo(url) {
    var tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 255, 255]))

    // let's assume all images are not a power of 2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    var textureInfo = {
      width: 1,
      height: 1,
      texture: tex
    }

    var img = new window.Image()
    img.addEventListener('load', function () {
      textureInfo.width = img.width
      textureInfo.height = img.height

      gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    })
    img.src = url

    return textureInfo
  }

  var textureInfos = [
    loadImageAndCreateTextureInfo('img/star.jpg'),
    loadImageAndCreateTextureInfo('img/leaves.jpg'),
    loadImageAndCreateTextureInfo('img/keyboard.jpg')
  ]

  var drawInfos = []
  var numToDraw = 9
  var speed = 60
  for (var ii = 0; ii < numToDraw; ++ii) {
    var drawInfo = {
      x: Math.random() * gl.canvas.width,
      y: Math.random() * gl.canvas.height,
      dx: Math.random() > 0.5 ? -1 : 1,
      dy: Math.random() > 0.5 ? -1 : 1,
      textureInfo: textureInfos[Math.random() * textureInfos.length | 0]
    }
    drawInfos.push(drawInfo)
  }

  function update(deltaTime) {
    drawInfos.forEach(function (drawInfo) {
      drawInfo.x += drawInfo.dx * speed * deltaTime
      drawInfo.y += drawInfo.dy * speed * deltaTime

      if (drawInfo.x < 0) {
        drawInfo.dx = 1
      }
      if (drawInfo.x >= gl.canvas.width) {
        drawInfo.dx = -1
      }
      if (drawInfo.y < 0) {
        drawInfo.dy = 1
      }
      if (drawInfo.y >= gl.canvas.height) {
        drawInfo.dy = -1
      }
    })
  }

  function draw() {
    // gl.canvas.width = gl.canvas.clientWidth
    // gl.canvas.height = gl.canvas.clientHeight
    // webglUtils.resizeCanvasToDisplaySize(gl.canvas)

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    gl.clear(gl.COLOR_BUFFER_BIT)

    drawInfos.forEach(function (drawInfo) {
      drawImage(
        drawInfo.textureInfo.texture,
        drawInfo.textureInfo.width,
        drawInfo.textureInfo.height,
        drawInfo.x,
        drawInfo.y)
    })
  }

  var then = 0
  function render(time) {
    var now = time * 0.001
    var deltaTime = Math.min(0.1, now - then)
    then = now

    update(deltaTime)
    draw()

    window.requestAnimationFrame(render)
  }

  window.requestAnimationFrame(render)

  // Unlike images, textures do not have a width and height associated
  // with them so we'll pass in the width and height of the texture
  function drawImage(tex, texWidth, texHeight, dstX, dstY) {
    gl.bindTexture(gl.TEXTURE_2D, tex)

    // Tell WebGL to use our shader program pair
    gl.useProgram(program)

    // Setup the attributes to pull data from our buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
    gl.enableVertexAttribArray(texcoordLocation)
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0)

    // this matrix will convert from pixels to clip space
    var matrix = orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1)

    // this matrix will translate our quad to dstX, dstY
    matrix = translate(matrix, dstX, dstY, 0, matrix)

    // this matrix will scale our 1 unit quad
    // from 1 unit to texWidth, texHeight units
    matrix = scale(matrix, texWidth, texHeight, 1, matrix)

    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix)

    // Tell the shader to get the texture from texture unit 0
    gl.uniform1i(textureLocation, 0)

    // draw the quad (2 triangles, 6 vertices)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  }
}

function orthographic(left, right, bottom, top, near, far, dst) {
  dst = dst || new Float32Array(16)

  dst[0] = 2 / (right - left)
  dst[1] = 0
  dst[2] = 0
  dst[3] = 0
  dst[4] = 0
  dst[5] = 2 / (top - bottom)
  dst[6] = 0
  dst[7] = 0
  dst[8] = 0
  dst[9] = 0
  dst[10] = 2 / (near - far)
  dst[11] = 0
  dst[12] = (left + right) / (left - right)
  dst[13] = (bottom + top) / (bottom - top)
  dst[14] = (near + far) / (near - far)
  dst[15] = 1

  return dst
}

function translate(m, tx, ty, tz, dst) {
  // This is the optimized version of
  // return multiply(m, translation(tx, ty, tz), dst)
  dst = dst || new Float32Array(16)

  var m00 = m[0]
  var m01 = m[1]
  var m02 = m[2]
  var m03 = m[3]
  var m10 = m[1 * 4 + 0]
  var m11 = m[1 * 4 + 1]
  var m12 = m[1 * 4 + 2]
  var m13 = m[1 * 4 + 3]
  var m20 = m[2 * 4 + 0]
  var m21 = m[2 * 4 + 1]
  var m22 = m[2 * 4 + 2]
  var m23 = m[2 * 4 + 3]
  var m30 = m[3 * 4 + 0]
  var m31 = m[3 * 4 + 1]
  var m32 = m[3 * 4 + 2]
  var m33 = m[3 * 4 + 3]

  if (m !== dst) {
    dst[0] = m00
    dst[1] = m01
    dst[2] = m02
    dst[3] = m03
    dst[4] = m10
    dst[5] = m11
    dst[6] = m12
    dst[7] = m13
    dst[8] = m20
    dst[9] = m21
    dst[10] = m22
    dst[11] = m23
  }

  dst[12] = m00 * tx + m10 * ty + m20 * tz + m30
  dst[13] = m01 * tx + m11 * ty + m21 * tz + m31
  dst[14] = m02 * tx + m12 * ty + m22 * tz + m32
  dst[15] = m03 * tx + m13 * ty + m23 * tz + m33

  return dst
}

function scale(m, sx, sy, sz, dst) {
  // This is the optimized verison of
  // return multiply(m, scaling(sx, sy, sz), dst)
  dst = dst || new Float32Array(16)

  dst[0] = sx * m[0 * 4 + 0]
  dst[1] = sx * m[0 * 4 + 1]
  dst[2] = sx * m[0 * 4 + 2]
  dst[3] = sx * m[0 * 4 + 3]
  dst[4] = sy * m[1 * 4 + 0]
  dst[5] = sy * m[1 * 4 + 1]
  dst[6] = sy * m[1 * 4 + 2]
  dst[7] = sy * m[1 * 4 + 3]
  dst[8] = sz * m[2 * 4 + 0]
  dst[9] = sz * m[2 * 4 + 1]
  dst[10] = sz * m[2 * 4 + 2]
  dst[11] = sz * m[2 * 4 + 3]

  if (m !== dst) {
    dst[12] = m[12]
    dst[13] = m[13]
    dst[14] = m[14]
    dst[15] = m[15]
  }

  return dst
}
