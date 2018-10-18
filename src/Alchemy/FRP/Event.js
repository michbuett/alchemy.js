exports.pureImpl = function (v) {
  return function constEvent(handler) {
    handler(v)
    return function unsubConstantEvent() {}
  }
}

exports.mapImpl = function (f, ev) {
  return function mapEvent(handler) {
    return ev(function mappedHandler(v) {
      handler(f(v))
    })
  }
}

exports.applyImpl = function (evF, evA) {
  return function (handler) {
    var currF, currA

    var unsubscribeF = evF(function (f) {
      currF = f
      if (typeof currA !== 'undefined') {
        handler(currF(currA))
      }
    })

    var unsubscribeA = evA(function (a) {
      currA = a
      if (typeof currF !== 'undefined') {
        handler(currF(currA))
      }
    })

    return function () {
      unsubscribeF()
      unsubscribeA()
    }
  }
}

exports.subscribe = function (ev) {
  return function (handler) {
    return function () {
      return ev(function (val) {
        handler(val)()
      })
    }
  }
}

exports.openChannel = openChannel

exports.foldp = function (fn) {
  return function (initialVal) {
    return function (ev) {
      var currVal = initialVal
      return multiplex(function (newVal) {
        currVal = fn(newVal)(currVal)
        return currVal
      }, ev)
    }
  }
}

exports.send = function (sender) {
  return function (val) {
    return function () {
      sender(val)
      return {}
    }
  }
}

exports.filter = function (fn) {
  return function (ev) {
    return function filterEvent(handler) {
      return ev(function filterHandler(newVal) {
        if (fn(newVal)) {
          handler(newVal)
        }
      })
    }
  }
}

exports.dropRepeats = function (eq) {
  return function (ev) {
    return function (handler) {
      var val
      return ev(function (newVal) {
        if (val === undefined || !eq['eq'](val)(newVal)) {
          handler(newVal)
          val = newVal
        }
      })
    }
  }
}

exports["dropRepeats'"] = function (ev) {
  return function (handler) {
    var val
    return ev(function (newVal) {
      if (val !== newVal) {
        handler(newVal)
        val = newVal
      }
    })
  }
}

exports.multiplex = function (ev) {
  return multiplex(id, ev)
}

exports.switcher = function (createSink) {
  return function (event) {
    return function (initialVal) {
      return function () {
        var unsubS = createSink(initialVal)()
        var unsubE = event(function (val) {
          unsubS()
          unsubS = createSink(val)()
        })

        return function () {
          unsubE()
          unsubS()
        }
      }
    }
  }
}

function id(v) {
  return v
}

function openChannel() {
  var subs = []
  var runIdx = -1

  return {
    event: function (sub) {
      subs.push(sub)

      return function () {
        var idx = subs.indexOf(sub)
        if (idx >= 0) {
          subs.splice(idx, 1)

          if (idx <= runIdx) {
            runIdx--
          }
        }
      }
    },

    sender: function (newVal) {
      for (runIdx = 0; runIdx < subs.length; runIdx++) {
        subs[runIdx](newVal)
      }
      runIdx = -1
    }
  }
}

function multiplex(f, ev) {
  var out = null
  var unsubParent = null
  var numSubs = 0

  return function (handler) {
    var unsubscribe

    if (out) {
      unsubscribe = out.event(handler)
    } else {
      out = openChannel()
      unsubscribe = out.event(handler)
      unsubParent = ev(function (newVal) {
        out.sender(f(newVal))
      })
    }

    numSubs++

    return function () {
      numSubs--
      unsubscribe()

      if (numSubs === 0) {
        unsubParent()
        out = null
        unsubParent = null
      }
    }
  }
}
