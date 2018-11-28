exports.openChannel = openChannel

exports.switcher = function (createSink) {
  return function (event) {
    return function (initialVal) {
      return function () {
        var unsubS = createSink(initialVal)()
        var unsubE = event(function (val) {
          unsubS()
          unsubS = createSink(val)()
        })()

        return function () {
          unsubE()
          unsubS()
        }
      }
    }
  }
}

function openChannel() {
  var subs = []
  var runIdx = -1

  return {
    event: function (sub) {
      return function subscribe() {
        subs.push(sub)

        return function cancel() {
          var idx = subs.indexOf(sub)
          if (idx >= 0) {
            subs.splice(idx, 1)

            if (idx <= runIdx) {
              runIdx--
            }
          }
        }
      }
    },

    sender: function (newVal) {
      return function notify() {
        for (runIdx = 0; runIdx < subs.length; runIdx++) {
          var eff = subs[runIdx](newVal)

          if (typeof eff !== 'function') {
            console.log('[Event#notify] invalid handler', subs[runIdx])
          } else {
            eff()
          }
        }
        runIdx = -1
      }
    }
  }
}

exports.multiplexImpl = function multiplex(connect, ev) {
  var out = null
  var unsubParent = null
  var numSubs = 0
  var f = null

  return function (handler) {
    return function () {
      var unsubscribe

      if (out) {
        unsubscribe = out.event(handler)()
      } else {
        out = openChannel()
        f = connect(out.sender)
        unsubscribe = out.event(handler)()
        unsubParent = ev(f)()
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
}

exports.unsafeRefEq = function (a) {
  return function (b) {
    return a === b
  }
}
