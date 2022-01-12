'use strict'

var vertexShaderSource = `
  attribute vec4 a_position;
  attribute vec2 a_texcoord;

  uniform mat4 u_matrix;

  varying vec2 v_texcoord;

  void main() {
    gl_Position = u_matrix * a_position;
    v_texcoord = a_texcoord;
  }
`

var fragmentShaderSource = `
  precision mediump float;

  varying vec2 v_texcoord;

  uniform sampler2D u_texture;

  void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord);
  }
`

exports.createProgram = function (gl) {
  var program = gl.createProgram()
  var shaders = [{
    shader: gl.createShader(gl.FRAGMENT_SHADER),
    source: fragmentShaderSource
  }, {
    shader: gl.createShader(gl.VERTEX_SHADER),
    source: vertexShaderSource
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
