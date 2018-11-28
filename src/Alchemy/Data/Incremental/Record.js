exports.unsafePatchRecord = function (isJust) {
  return function (Just) {
    return function (Nothing) {
      return function (changes) {
        return function (source) {
          var keys = Object.keys(source)
          var target = {}
          var applied = {}
          var wasChanged = false

          for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i]
            var val = source[key]
            var change = changes[key]

            if (change) {
              var increment = change(val)

              target[key] = increment.new
              applied[key] = increment.delta
              wasChanged = wasChanged || isJust(increment.delta)
            } else {
              target[key] = val
              applied[key] = Nothing
            }
          }

          // console.log('[unsafePatchRecord]')
          // console.log('target:', target)
          // console.log('applied:', JSON.stringify(applied, null, '  '))

          return {
            new: target,
            delta: wasChanged ? Just(applied) : Nothing
          }
        }
      }
    }
  }
}
