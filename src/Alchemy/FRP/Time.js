exports.tickImpl = function (openChannel) {
  return function () {
    var channel = openChannel()
    var elapsedMS = 0
    var TARGET_FPMS = 60 / 1000
    var MAX_ELAPSED = 100
    var lastTick = window.performance.now()
    var tick = function (now) {
      if (now > lastTick) {
        elapsedMS = now - lastTick
        if (elapsedMS > MAX_ELAPSED) {
          elapsedMS = MAX_ELAPSED
        }
        // console.log('requestAnimationFrame')
        channel.sender(elapsedMS * TARGET_FPMS)()
      }
      lastTick = now
      window.requestAnimationFrame(tick)
    }

    window.requestAnimationFrame(tick)

    return channel.event
  }
}
