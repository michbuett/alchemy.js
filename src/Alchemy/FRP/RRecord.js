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

exports.unsafePatchRecord = function (changes) {
  return function (r) {
    var target = {}
    var keys = Object.keys(r)

    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i]
      var val = r[key]
      var change = changes[key]

      if (change) {
        target[key] = change.patch(val)
      } else {
        target[key] = val
      }
    }

    return target
  }
}

exports.cloneArray = function (a) {
  return [].concat(a)
}

exports.unsafeUpdateAt = function (i) {
  return function (patchFn) {
    return function (a) {
      a[i] = patchFn(a[i])
      return a
    }
  }
}

exports.unsafeInsertAt = function (i) {
  return function (v) {
    return function (a) {
      a.splice(i, 0, v)
      return a
    }
  }
}

exports.unsafeDeleteAt = function (i) {
  return function (a) {
    a.splice(i, 1)
    return a
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
