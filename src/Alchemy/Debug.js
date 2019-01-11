exports.debugLog = function (o) {
  return function () {
    console.log('[DEBUG]', typeof o, o)
  }
}
