function make(openChannel, data) {
  console.log('[make]')

  var currVal = data
  var channel = openChannel()

  return {
    get: function () {
      return currVal
    },

    set: function (newVal) {
      currVal = newVal
      channel.send(newVal)
    },

    subscribe: channel.event
  }
}

exports.create = make

exports.modify = function (Patch) {
  return function (fn) {
    return function (rstate) {
      return function () { // Effect Unit
        var changes = fn(rstate.get())
        console.log('changes', changes)
      }
    }
  }
}

exports.updateImpl = function (key, newVal, oldRec) {
}

exports.debugShow = function (typeName) {
  return function (obj) {
    var content = (typeof obj.get === 'function') ? obj.get() : obj
    return typeName + '(' + JSON.stringify(content, null, '  ') + ')'
  }
}

exports.unsafeGet = function (r) {
  return function (key) {
    return r[key]
  }
}

exports.unsafeSet = function (r) {
  return function (key) {
    return function (val) {
      r[key] = val
      return r
    }
  }
}

exports.unsafeMerge = function (r1) {
  return function (r2) {
    return Object.assign({}, r1, r2)
  }
}

exports.patchOneRecordEntry = function (key) {
  return function (patchFn) {
    return function (r) {
      r[key] = patchFn(r[key])
      return r
    }
  }
}

exports.parseChanges = function (changeRecord) {
  var keys = Object.keys(changeRecord)
  var result = []

  for (var i = 0, l = keys.length; i < l; i++) {
    var key = key[i]
    result.push({ key: key, change: changeRecord[key] })
  }

  return result
}

exports.unsafePatchRecord = function (r) {
  return function (changes) {
  }
}

/*
exports.patchOneRecordEntry = function (arg1) {
  console.log('[patchOneRecordEntry] 1', arg1)
  return function (arg2) {
    console.log('[patchOneRecordEntry] 2', arg2)
    return function (arg3) {
      console.log('[patchOneRecordEntry] 3', arg3)
      return function (arg4) {
        console.log('[patchOneRecordEntry] 4', arg4)
        return function (arg5) {
          console.log('[patchOneRecordEntry] 5', arg5)
          return function (arg6) {
            console.log('[patchOneRecordEntry] 6', arg6)
          }
        }
      }
    }
  }
}
*/

function patchRecord(r) {
  return function changes(dr) {
    var data = r.get()
    var newData = {}
    var keys = Object.keys(data)
    var observations = []

    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i]
      var subData = data[key]
      var change = dr[key]

      if (change) {
        newData[key] = patch(subData, change)

        if (isReactivData(subData)) {
          observations.push(makeObservation(change, newData[key]))
        }
      } else {
        newData[key] = subData
      }
    }

    observations.push(makeObservation(dr, newData))

    return { result: newData, observation: observations }
  }
}

/*
var Store = function (data) {
  this._data = data
}

Store.prototype.key = function (key) {
  var subStore = new Store(this._data[key])

  subStore.observe(function (newVal) {
    var newData = Object.assign({}, this._data)
    this.set(key, newVal)
  })
}

Store.prototype.observe = function (observer) {
}
*/

exports.cloneRecord = function (r) {
  return Object.assign({}, r)
}
