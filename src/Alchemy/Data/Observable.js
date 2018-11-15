exports.initStorage = function (openChannel, v) {
  var changesChannel = openChannel()
  var currentOIV = liftIncrementalValue(openChannel(), v)

  changesChannel.event(function (changes) {
    var newOIV = currentOIV.patch(changes).new

    // mutate references to remember state changes
    currentOIV.value = newOIV.value
    currentOIV.patch = newOIV.patch
  })

  return {
    oiValue: currentOIV,
    sender: changesChannel.sender
  }
}

exports.updates = function (o) {
  // console.log('[updates]', o)
  return o.updates
}

exports.sample = function (o) {
  return function () {
    return o.value
  }
}

exports.subImpl = function (openChannel) {
  return function (key) {
    return function (oiRecord) {
      var sub = oiRecord.value[key]

      if (!sub.updates) {
        sub = liftIncrementalValue(openChannel(), sub)
        oiRecord.value[key] = sub
      }

      return sub
    }
  }
}

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
// PRIVATE HELPER
//

function liftIncrementalValue(updateChannel, currentVal) {
  return {
    value: currentVal.value,

    patch: function (delta) {
      var increment = currentVal.patch(delta)

      updateChannel.sender(increment.delta)

      return {
        new: liftIncrementalValue(updateChannel, increment.new),
        delta: increment.delta
      }
    },

    updates: updateChannel.event
  }
}
