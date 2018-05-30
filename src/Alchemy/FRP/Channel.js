'use strict'

function Channel() {
  this._subscribers = []
  this._last = undefined
}

Channel.prototype.subscribe = function (sub) {
  var subs = this._subscribers
  subs.push(sub)

  return function () {
    var index = subs.indexOf(sub)
    if (index >= 0) {
      subs.splice(index, 1)
    }
  }
}

Channel.prototype.lastVal = function () {
  return this._last
}

Channel.prototype.send = function (val) {
  for (var i = 0, l = this._subscribers.length; i < l; i++) {
    this._subscribers[i](val)
  }
  this._last = val
}

exports.channel = function () {
  return new Channel()
}

exports.subscribe = function (handler) {
  return function (channel) {
    return function () {
      return channel.subscribe(function (val) {
        handler(val)()
      })
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

exports.last = function (defaultVal) {
  return function (channel) {
    return function () {
      var val = channel.lastVal()
      return typeof val === 'undefined' ? defaultVal : val
    }
  }
}
