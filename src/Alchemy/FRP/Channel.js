'use strict'

function Channel() {
  this._subscribers = []
  this._last = undefined
  this._idx = -1
}

Channel.prototype.subscribe = function (sub) {
  var subs = this._subscribers
  var self = this

  subs.push(sub)

  return function () {
    var index = subs.indexOf(sub)
    if (index >= 0) {
      subs.splice(index, 1)
      if (index <= self._idx) {
        self._idx--
      }
    }
  }
}

Channel.prototype.lastVal = function () {
  return this._last
}

Channel.prototype.send = function (val) {
  for (this._idx = 0; this._idx < this._subscribers.length; this._idx++) {
    this._subscribers[this._idx](val)
  }
  this._last = val
  this._idx = -1
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
