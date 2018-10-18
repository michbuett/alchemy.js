exports.initStorage = function (openChannel, v) {
  var changesChannel = openChannel()
  var currentOIV = liftIncrementalValue(openChannel(), v)

  changesChannel.event(function (changes) {
    var newOIV = currentOIV.patch(changes)

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

// exports.debug = function (obj) {
//   return function () {
//     console.log('[DEBUG]', JSON.stringify(obj, null, '  '))
//   }
// }

// //////////////////////////////////////////////////////////
// //////////////////////////////////////////////////////////
// PRIVATE HELPER
//

// function makeAtomic(openChannel, data) {
//   // console.log('[make]')
//
//   var currVal = data
//   var valueChannel = openChannel()
//   var updateChannel = openChannel()
//
//   return {
//     getValue: function () {
//       return currVal
//     },
//
//     patch: function (change) {
//       // console.log('[patch]', JSON.stringify(change, null, '  '))
//       var delta = change.delta
//       var patchFn = change.patch
//       var oldVal = currVal
//       var newVal = patchFn(currVal)
//
//       if (newVal === currVal) {
//         return
//       }
//
//       currVal = newVal
//
//       // console.log('[patch] send new value', newVal)
//       valueChannel.send(newVal)
//
//       // console.log('[patch] send update')
//       updateChannel.send({
//         oldValue: oldVal,
//         newValue: newVal,
//         delta: delta
//       })
//     },
//
//     values: valueChannel.event,
//
//     updates: updateChannel.event
//   }
// }
//
// function makeRecord(openChannel, data) {
//   var subData = data
//   var valueChannel = openChannel()
//   var updateChannel = openChannel()
//   var currVal = mapRec(function (item) { return item.getValue() }, data)
//
//   function patchRecord(changes) {
//     // console.log('[patch]', JSON.stringify(change, null, '  '))
//     var delta = changes.delta
//     var patchFn = changes.patch
//     var oldVal = currVal
//     var newVal = patchFn(currVal)
//
//     if (newVal === currVal) {
//       return
//     }
//
//     currVal = newVal
//
//     // console.log('[patch] send new value', newVal)
//     valueChannel.send(newVal)
//
//     // console.log('[patch] send update')
//     updateChannel.send({
//       oldValue: oldVal,
//       newValue: newVal,
//       delta: delta
//     })
//
//     // ^^var deltas = changes.delta
//     // ^^var oldVal = currVal
//     // ^^var keys = Object.keys(oldVal)
//     // ^^var newVal = {}
//
//     // ^^for (var i = 0, l = keys.length; i < l; i++) {
//     // ^^  var key = keys[i]
//     // ^^  var change = deltas[key]
//
//     // ^^  if (change) {
//     // ^^    subData[key].patch(change)
//     // ^^    newVal[key] = subData[key].getValue()
//     // ^^  } else {
//     // ^^    newVal[key] = oldVal[key]
//     // ^^  }
//     // ^^}
//
//     // ^^currVal = newVal
//
//     // ^^valueChannel.send(currVal)
//
//     // ^^updateChannel.send({
//     // ^^  oldValue: oldVal,
//     // ^^  newValue: newVal,
//     // ^^  delta: deltas
//     // ^^})
//   }
//
//   return {
//     getValue: function () {
//       return currVal
//     },
//
//     sub: function (key) {
//       return Object.assign({}, subData[key], {
//         patch: function (change) {
//           var delta = {}
//           delta[key] = change
//           patchRecord({ delta: delta })
//         }
//       })
//     },
//
//     patch: patchRecord,
//
//     values: valueChannel.event,
//
//     updates: updateChannel.event
//   }
// }
//
// function mapRec(fn, rec) {
//   var result = {}
//   var keys = Object.keys(rec)
//
//   for (var i = 0, l = keys.length; i < l; i++) {
//     var key = keys[i]
//     var value = rec[key]
//
//     result[key] = fn(value, key)
//   }
//
//   return result
// }

function liftIncrementalValue(updateChannel, currentVal) {
  return {
    value: currentVal.value,

    patch: function (delta) {
      var newVal = currentVal.patch(delta)

      // console.log('[patch] send update', currentVal.value, newVal.value)
      updateChannel.sender({
        oldValue: currentVal,
        newValue: newVal,
        delta: delta
      })

      return liftIncrementalValue(updateChannel, newVal)
    },

    updates: updateChannel.event
  }
}
