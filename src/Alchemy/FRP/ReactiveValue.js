function dropRepeat(subscribe) {
  return function (handler) {
    var lastVal

    return subscribe(function (newVal) {
      if (lastVal !== newVal) {
        lastVal = newVal
        handler(newVal)
      }
    })
  }
}

exports.constantRV = function (v) {
  return function constRV(handler) {
    handler(v)
    return function () {}
  }
}

exports.stepRV = function (v) {
  return function (c) {
    return dropRepeat(function (handler) {
      var lastVal = c.lastVal()

      if (typeof lastVal === 'undefined') {
        handler(v)
      } else {
        handler(lastVal)
      }

      return c.subscribe(handler)
    })
  }
}

exports.createRV = function (initialVal) {
  return function () {
    var currVal = initialVal
    var subs = []

    return {
      rv: function (sub) {
        subs.push(sub)
        sub(currVal)

        return function () {
          var idx = subs.indexOf(sub)
          if (idx >= 0) {
            subs.splice(idx, 1)
          }
        }
      },

      setValue: function (newVal) {
        return function () {
          if (newVal === currVal) {
            return
          }

          currVal = newVal
          for (var i = 0, l = subs.length; i < l; i++) {
            subs[i](newVal)
          }
        }
      }
    }
  }
}

exports.mapImpl = function (f, rv) {
  return dropRepeat(function (handler) {
    return rv(function (v) {
      handler(f(v))
    })
  })
}

exports.applyImpl = function (rvF, rvA) {
  return dropRepeat(function (handler) {
    var currF, currA

    var unsubscribeF = rvF(function (f) {
      currF = f
      if (typeof currA !== 'undefined') {
        handler(currF(currA))
      }
    })

    var unsubscribeA = rvA(function (a) {
      currA = a
      handler(currF(currA))
    })

    return function () {
      unsubscribeF()
      unsubscribeA()
    }
  })
}

exports.bindImpl = function (rv, f) {
  return dropRepeat(function (handler) {
    var unsubscribeTmp

    var unsubscribeIn = rv(function (a) {
      if (typeof unsubscribeTmp === 'function') {
        unsubscribeTmp()
      }

      unsubscribeTmp = f(a)(handler)
    })

    return function () {
      unsubscribeIn()
      unsubscribeTmp()
    }
  })
}

exports.sinkRV = function (rv) {
  return function () {
    return rv(function (eff) {
      eff()
    })
  }
}

exports.inspectRV = function (rv) {
  var currVal
  var getCurrVal = function (v) { currVal = v }

  return function () {
    rv(getCurrVal)()
    return currVal
  }
}

exports.open = function () {
  var subs = []

  return {
    event: function (sub) {
      subs.push(sub)

      return function () {
        var idx = subs.indexOf(sub)
        if (idx >= 0) {
          subs.splice(idx, 1)
        }
      }
    },

    channel: function (newVal) {
      return function () {
        for (var i = 0; i < subs.length; i++) {
          subs[i](newVal)
        }
      }
    }
  }
}
