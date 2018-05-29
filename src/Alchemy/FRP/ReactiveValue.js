function dropRepeat(subscriber) {
  var lastVal
  return function (newVal) {
    if (lastVal === newVal) {
      return
    }
    lastVal = newVal
    subscriber(newVal)
  }
}

function make(subscribeToParent) {
  var currVal, unsubscribe
  var subs = []

  var setVal = function (newVal) {
    if (newVal === currVal) {
      return
    }

    currVal = newVal
    for (var i = 0, l = subs.length; i < l; i++) {
      subs[i](newVal)
    }
  }

  return function (o) {
    if (subs.length === 0) {
      // first time someone is interessed in an actual value
      // => start listening to changes
      unsubscribe = subscribeToParent(setVal)
    }

    subs.push(o)
    o(currVal)

    return function () {
      var index = subs.indexOf(o)
      if (index >= 0) {
        subs.splice(index, 1)
        if (subs.length === 0 && typeof unsubscribe === 'function') {
          // the last listener was removed and nobody is interessted in
          // updates anymore
          // => stop listening (a channel records further events an
          // we can continue to listen if there are new subscribers)
          unsubscribe()
          unsubscribe = undefined
        }
      }
    }
  }
}

exports.constant = function (v) {
  return make(function (handler) {
    handler(v)
  })
}

exports.step = function (v) {
  return function (c) {
    return make(function (handler) {
      handler(v)
      return c.subscribe(handler)
    })
  }
}

exports.mapImpl = function (f, rv) {
  return make(function (handler) {
    return rv(function (v) {
      handler(f(v))
    })
  })
}

exports.applyImpl = function (rvF, rvA) {
  return make(function (handler) {
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
  return make(function (handler) {
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

exports.run = function (rv) {
  return function () {
    return rv(function (eff) {
      eff()
    })
  }
}

exports.inspect = function (rv) {
  return function () {
    var result
    rv(function (v) {
      result = v
    })()
    return result
  }
}

exports.merge = function (rv1) {
  return function (rv2) {
    return make(function (handler) {
      var setVal = function (v) { handler(v) }
      var unsubscribe1 = rv1(setVal)
      var unsubscribe2 = rv2(setVal)

      return function () {
        unsubscribe1()
        unsubscribe2()
      }
    })
  }
}

exports.testRV = function (rv) {
  return function () {
    rv(function (val) {
      console.log('[test log]', val)
    })
  }
}

exports.simpleMap = function (f) {
  return function (e) {
    return dropRepeat(function (sub) {
      return e(function (a) {
        sub(f(a))
      })
    })
  }
}
