exports.render = function (rootSelector) {
  return function (dom) {
    // console.log('[DOM render] create render effect')
    return function () {
      // console.log('[DOM render] run effect')
      var node = document.querySelector(rootSelector)
      return dom(node)()
    }
  }
}
