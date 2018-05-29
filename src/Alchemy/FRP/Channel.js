'use strict'

function Channel() {
  this.handler = []
  this.lastVal = undefined
}

Channel.prototype.subscribe = function (handler) {
  // console.log('subscribe', this.lastVal)
  this.handler.push(handler)

  if (this.lastVal !== undefined) {
    handler(this.lastVal)
  }

  var hl = this.handler
  return function () {
    var index = hl.indexOf(handler)
    if (index >= 0) {
      hl.splice(index, 1)
    }
  }
}

Channel.prototype.send = function (val) {
  // console.log('send', val)
  for (var i = 0, l = this.handler.length; i < l; i++) {
    this.handler[i](val)
  }
  this.lastVal = val
}

exports.channel = function () {
  return new Channel()
}

exports.subscribe = function (handler) {
  return function (channel) {
    return function () {
      channel.subscribe(function (val) {
        handler(val)()
      })
      return {}
    }
  }
}

exports.send = function (channel) {
  return function (val) {
    return function () {
      channel.send(val)
      return {}
    }
  }
}

exports.last = function (def) {
  return function (channel) {
    return typeof channel.lastVal === 'undefined' ? def : channel.lastVal
  }
}

exports.mapImpl = function (f) {
  return function (channel) {
    return new Channel()
  }
}
