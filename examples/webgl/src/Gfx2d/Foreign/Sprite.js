'use strict'

var program
var positionBuffer
var texcoordBuffer

exports.spriteRenderImpl = function (cfg) {
  return function (ctxt) { // Ctxt -> Effect { spriteData, remove }
    return function () {
      var s = Object.assign({}, cfg)
      var gl = ctxt.gl
      var cw = ctxt.canvas.width
      var ch = ctxt.canvas.height

      program = program || createSprite2dProgramm(gl)
      positionBuffer = positionBuffer || createBuffer(gl)
      texcoordBuffer = texcoordBuffer || createBuffer(gl)

      // look up where the vertex data needs to go.
      var positionLocation = gl.getAttribLocation(program, 'a_position')
      var texcoordLocation = gl.getAttribLocation(program, 'a_texcoord')

      // lookup uniforms
      var matrixLocation = gl.getUniformLocation(program, 'u_matrix')
      var textureLocation = gl.getUniformLocation(program, 'u_texture')

      var tex = loadImageAndCreateTexture(gl, s.texture)

      function draw() {
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
        var matrix = orthographic(0, cw, ch, 0, -1, 1)

        // this matrix will translate our quad to dstX, dstY
        translate(matrix, s.xpos, s.ypos, 0, matrix)

        // this matrix will scale our 1 unit quad
        // from 1 unit to texWidth, texHeight units
        scale(matrix, s.width, s.height, 1, matrix)

        // Set the matrix.
        gl.uniformMatrix4fv(matrixLocation, false, matrix)

        // Tell the shader to get the texture from texture unit 0
        gl.uniform1i(textureLocation, 0)

        // draw the quad (2 triangles, 6 vertices)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      }

      ctxt.graphics.push(draw)

      return {
        sprite: s,
        remove: function () {
          ctxt.graphics = ctxt.graphics.filter(function (fn) {
            return fn !== draw
          })
        }
      }
    }
  }
}

// exports.list = function (sl) {
//   return function (ctxt) { // Graphic ( Ctxt -> Effect { update, remove } )
//     return function () {
//       var graphics = sl.map(function (s) { return s(ctxt)() })
//
//       return {
//         update: function (a) {
//           return function () {
//           }
//         },
//
//         remove: function () {
//         }
//       }
//     }
//   }
// }

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
// PRIVATE HELPER

function createSprite2dProgramm(gl) {
  var program = gl.createProgram()
  var shaders = [{
    shader: gl.createShader(gl.FRAGMENT_SHADER),
    source: [
      'precision mediump float;',

      'varying vec2 v_texcoord;',

      'uniform sampler2D u_texture;',

      'void main() {',
      '  gl_FragColor = texture2D(u_texture, v_texcoord);',
      '}'
    ].join('')
  }, {
    shader: gl.createShader(gl.VERTEX_SHADER),
    source: [
      'attribute vec4 a_position;',
      'attribute vec2 a_texcoord;',

      'uniform mat4 u_matrix;',

      'varying vec2 v_texcoord;',

      'void main() {',
      '  gl_Position = u_matrix * a_position;',
      '  v_texcoord = a_texcoord;',
      '}'
    ].join('')
  }]

  shaders.forEach(function (p) {
    gl.shaderSource(p.shader, p.source)
    gl.compileShader(p.shader)

    if (!gl.getShaderParameter(p.shader, gl.COMPILE_STATUS)) {
      throw new Error('Cannot compile shader: ' + gl.getShaderInfoLog(p.shader))
    }

    gl.attachShader(program, p.shader)
  })

  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    // something went wrong with the link
    var lastError = gl.getProgramInfoLog(program)
    throw new Error('Error in program linking: ' + lastError)
  }

  return program
}

function loadImageAndCreateTexture(gl, url) {
  var tex = gl.createTexture()

  // init texture with 1x1 blue pixel while image is loading
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255]))

  // let's assume all images are not a power of 2
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

  var img = new window.Image()
  img.addEventListener('load', function () {
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
  })

  img.src = url

  return tex
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

function createBuffer(gl) {
  var buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

  var data = new Float32Array([ 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1 ])

  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

  return buffer
}
