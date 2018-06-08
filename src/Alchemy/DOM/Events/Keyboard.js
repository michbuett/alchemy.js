// exports.keydownFn = function keyPressedP(channel) {
//   return function keyPressedP(event) {
//     return function () {
//       window.addEventListener(event, function(e) {
//         channel.send({
//           code: e.code,
//           ctrlKey: e.ctrlKey,
//           shiftKey: e.shiftKey,
//           altKey: e.altKey,
//           metaKey: e.metaKey,
//         });
//       });
//       return channel;
//     };
//   };
// };

var channel
var pressedKeys

exports.pressed = function (code) {
  return function (keys) {
    return !!keys[code]
  }
}

exports.keyboard = function () {
  return pressedKeys || {}
}

exports.onKeyChangeImpl = function (openChannel) {
  return function () {
    if (!channel) {
      channel = openChannel()
    }

    return channel.event
  }
}

function onKeyDown(e) {
  var code = e.code
  if (pressedKeys && pressedKeys[code]) {
    return
  }

  var pressedCodes = Object.keys(pressedKeys || {}).concat(code)

  pressedKeys = {}
  pressedCodes.forEach(function (c) {
    pressedKeys[c] = true
  })

  if (channel) {
    channel.send(pressedKeys)
  }
}

function onKeyUp(e) {
  var pressedCodes = Object.keys(pressedKeys)

  pressedKeys = {}
  pressedCodes.forEach(function (c) {
    if (c !== e.code) {
      pressedKeys[c] = true
    }
  })

  if (channel) {
    channel.send(pressedKeys)
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.body.addEventListener('keydown', onKeyDown)
  document.body.addEventListener('keyup', onKeyUp)
})

document.addEventListener('unload', function () {
  document.body.removeEventListener('keydown', onKeyDown)
  document.body.removeEventListener('keyup', onKeyUp)
})
