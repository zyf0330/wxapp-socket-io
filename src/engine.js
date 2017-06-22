import Emitter from 'component-emitter'
import on from './on'
import parsejson from './parsejson'
import bind from 'component-bind'
import parseuri from 'parseuri'
import parseqs from 'parseqs'

export default Engine

const GlobalEmitter = Emitter({ hasEmitte: false })

Emitter(Engine.prototype)

const packets = {
  open:     0,    // non-ws
  close:    1,    // non-ws
  ping:     2,
  pong:     3,
  message:  4,
  upgrade:  5,
  noop:     6,
}

const packetslist = Object.keys(packets)

function Engine(uri, opts) {
  if (!(this instanceof Engine)) return new Engine(uri, opts)

  this.subs = []
  uri = parseuri(uri)
  this.protocol = uri.protocol
  this.host = uri.host

  if (uri.query) opts.query = uri.query;
  this.query = opts.query || {};
  if ('string' === typeof this.query) this.query = parseqs.decode(this.query);

  this.port = uri.port
  this.opts = this.opts || {}
  this.path = opts.path.replace(/\/$/, '')
  this.connected = false
  this.lastPing = null
  this.pingInterval = 20000
  this.readyState = ''

  if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
    this.extraHeaders = opts.extraHeaders;
  }

  // init bind with GlobalEmitter
  this.bindEvents()
}

Engine.prototype.connect = function() {
  if (!GlobalEmitter.hasEmitte) Engine.subEvents()
  this.query.EIO = 3
  this.query.transport = 'websocket'
  const url = `${this.protocol}://${this.host}:${this.port}/${this.path}/?${parseqs.encode(this.query)}`

  this.readyState = 'opening'
  wx.connectSocket({ url, header: this.extraHeaders })
}

Engine.prototype.onopen = function() {
  this.readyState = 'open'
  this.emit('open')
}

Engine.prototype.onclose = function(reason) {
  if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
    // clean all bind with GlobalEmitter
    this.destroy()
    this.emit('close', reason)
  }
}

Engine.prototype.onerror = function(reason) {
  this.emit('error', reason)
  // 如果 wx.connectSocket 还没回调 wx.onSocketOpen，而先调用 wx.closeSocket，那么就做不到关闭 WebSocket 的目的。
  wx.closeSocket()
}

Engine.prototype.onpacket = function(packet) {
  switch (packet.type) {
  case 'open':
    this.onHandshake(parsejson(packet.data))
    break
  case 'pong':
    this.setPing()
    this.emit('pong')
    break
  case 'error': {
    const error = new Error('server error')
    error.code = packet.data
    this.onerror(error)
    break
  }
  case 'message':
    this.emit('data', packet.data)
    this.emit('message', packet.data)
    break
  }
}

Engine.prototype.onHandshake = function(data) {
  this.id = data.sid
  this.pingInterval = data.pingInterval
  this.pingTimeout = data.pingTimeout
  if ('closed' === this.readyState) return
  this.setPing()
}

Engine.prototype.setPing = function() {
  clearTimeout(this.pingIntervalTimer)
  this.pingIntervalTimer = setTimeout(() => {
    this.ping()
  }, this.pingInterval)
}

Engine.prototype.ping = function() {
  this.emit('ping')
  this._send(`${packets.ping}probe`)
}

Engine.prototype.write =
Engine.prototype.send = function(packet) {
  this._send([packets.message, packet].join(''))
}

Engine.prototype._send = function(data) {
  if ('closing' === this.readyState || 'closed' === this.readyState) {
    return
  }
  wx.sendSocketMessage({ data })
}
Engine.subEvents = function() {
  wx.onSocketOpen(() => {
    GlobalEmitter.emit('open')
  })
  wx.onSocketClose(reason => {
    // console.log('wx.onSocketClose fired!!!')
    GlobalEmitter.emit('close', reason)
  })
  wx.onSocketError(reason => {
    GlobalEmitter.emit('error', reason)
  })
  wx.onSocketMessage(resp => {
    GlobalEmitter.emit('packet', decodePacket(resp.data))
  })
  GlobalEmitter.hasEmitte = true
}

Engine.prototype.bindEvents = function() {
  this.subs.push(on(GlobalEmitter, 'open', bind(this, 'onopen')))
  this.subs.push(on(GlobalEmitter, 'close', bind(this, 'onclose')))
  this.subs.push(on(GlobalEmitter, 'error', bind(this, 'onerror')))
  this.subs.push(on(GlobalEmitter, 'packet', bind(this, 'onpacket')))
}

Engine.prototype.destroy = function() {
  let sub
  while (sub = this.subs.shift()) { sub.destroy() }

  clearTimeout(this.pingIntervalTimer)
  this.readyState = 'closed'
  this.id = null
  this.writeBuffer = []
  this.prevBufferLen = 0

  wx.closeSocket()
}

function decodePacket(data) {
  const type = data.charAt(0)
  if (data.length > 1) {
    return {
      type: packetslist[type],
      data: data.substring(1),
    }
  }
  return { type: packetslist[type] }
}

/**
 * Closes the connection.
 *
 * @api private
 */

Engine.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.readyState = 'closing'
    this.onclose('force close')
    // wx.closeSocket()
  }
  return this;
}
