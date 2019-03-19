exports.debugLog = function (msg) {
  return function (o) {
    return function () {
      console.groupCollapsed('[DEBUG] ' + msg)
      if (typeof o === 'object') {
        if (!o) {
          console.log('NULL')
        } else if (o.constructor === Object) {
          console.log('OBJECT', o)
        } else {
          console.log(o.constructor.name, o)
        }
      } else {
        console.log(' > ', (typeof o).toUpperCase(), o)
      }
      console.trace()
      console.groupEnd()
    }
  }
}
