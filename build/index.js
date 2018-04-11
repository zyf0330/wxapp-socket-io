'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index$1 = createCommonjsModule(function (module) {
/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};
});

/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

var index$2 = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

/**
 * Expose `Backoff`.
 */

var index$3 = Backoff;

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}

/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */

Backoff.prototype.duration = function(){
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};

/**
 * Reset the number of attempts.
 *
 * @api public
 */

Backoff.prototype.reset = function(){
  this.attempts = 0;
};

/**
 * Set the minimum duration
 *
 * @api public
 */

Backoff.prototype.setMin = function(min){
  this.ms = min;
};

/**
 * Set the maximum duration
 *
 * @api public
 */

Backoff.prototype.setMax = function(max){
  this.max = max;
};

/**
 * Set the jitter
 *
 * @api public
 */

Backoff.prototype.setJitter = function(jitter){
  this.jitter = jitter;
};

var indexOf = [].indexOf;

var index$4 = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

var on = (function (obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function destroy() {
      obj.removeListener(ev, fn);
    }
  };
});

/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

var parsejson = function parsejson(data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@').replace(rvalidtokens, ']').replace(rvalidbraces, ''))) {
    return new Function('return ' + data)();
  }
};

/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

var index$5 = function parseuri(str) {
    var src = str,
        b = str.indexOf('['),
        e = str.indexOf(']');

    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
        uri = {},
        i = 14;

    while (i--) {
        uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }

    return uri;
};

/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

var encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

var decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};

var index$6 = {
	encode: encode,
	decode: decode
};

index$1(Engine$1.prototype);

var packets = {
	open: 0, // non-ws
	close: 1, // non-ws
	ping: 2,
	pong: 3,
	message: 4,
	upgrade: 5,
	noop: 6
};

var packetslist = Object.keys(packets);

function Engine$1(uri, opts) {
	if (!(this instanceof Engine$1)) return new Engine$1(uri, opts);

	this.subs = [];
	uri = index$5(uri);
	this.protocol = uri.protocol;
	this.host = uri.host;

	if (uri.query) opts.query = uri.query;
	this.query = opts.query || {};
	if ('string' === typeof this.query) this.query = index$6.decode(this.query);

	this.port = uri.port;
	this.opts = this.opts || {};
	this.path = opts.path.replace(/\/$/, '');
	this.connected = false;
	this.lastPing = null;
	this.pingInterval = 20000;
	this.readyState = '';

	if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
		this.extraHeaders = opts.extraHeaders;
	}

	// init bind with GlobalEmitter
	this.GlobalEmitter = index$1({});
	this.bindEvents();

	this.wxSocketTask = null;
}

Engine$1.prototype.connect = function () {
	this.query.EIO = 3;
	this.query.transport = 'websocket';
	var url = this.protocol + '://' + this.host + ':' + this.port + '/' + this.path + '/?' + index$6.encode(this.query);
	this.readyState = 'opening';
	this.wxSocketTask = wx.connectSocket({ url: url, header: this.extraHeaders });

	this.subEvents();
};

Engine$1.prototype.onopen = function () {
	this.readyState = 'open';
	this.emit('open');
};

Engine$1.prototype.onclose = function (reason) {
	if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
		// clean all bind with GlobalEmitter
		this.destroy();
		this.emit('close', reason);
	}
};

Engine$1.prototype.onerror = function (reason) {
	this.emit('error', reason);
	// wx onOpen 回调后，关闭连接才能生效
	if (this.readyState == 'open') {
		this.wxSocketTask.close();
	}
};

Engine$1.prototype.onpacket = function (packet) {
	switch (packet.type) {
		case 'open':
			this.onHandshake(parsejson(packet.data));
			break;
		case 'pong':
			this.setPing();
			this.emit('pong');
			break;
		case 'error':
			{
				var error = new Error('server error');
				error.code = packet.data;
				this.onerror(error);
				break;
			}
		case 'message':
			this.emit('data', packet.data);
			this.emit('message', packet.data);
			break;
	}
};

Engine$1.prototype.onHandshake = function (data) {
	this.id = data.sid;
	this.pingInterval = data.pingInterval;
	this.pingTimeout = data.pingTimeout;
	if ('closed' === this.readyState) return;
	this.setPing();
};

Engine$1.prototype.setPing = function () {
	var _this = this;

	clearTimeout(this.pingIntervalTimer);
	this.pingIntervalTimer = setTimeout(function () {
		_this.ping();
	}, this.pingInterval);
};

Engine$1.prototype.ping = function () {
	this.emit('ping');
	this._send(packets.ping + 'probe');
};

Engine$1.prototype.write = Engine$1.prototype.send = function (packet) {
	this._send([packets.message, packet].join(''));
};

Engine$1.prototype._send = function (data) {
	if ('closing' === this.readyState || 'closed' === this.readyState) {
		return;
	}
	this.wxSocketTask.send({ data: data });
};
Engine$1.prototype.subEvents = function () {
	var _this2 = this;

	this.wxSocketTask.onOpen(function () {
		_this2.GlobalEmitter.emit('open');
	});
	this.wxSocketTask.onClose(function (reason) {
		// console.log('wxSocketTask.onClose fired!!!')
		_this2.GlobalEmitter.emit('close', reason);
	});
	this.wxSocketTask.onError(function (reason) {
		_this2.GlobalEmitter.emit('error', reason);
	});
	this.wxSocketTask.onMessage(function (resp) {
		_this2.GlobalEmitter.emit('packet', decodePacket(resp.data));
	});
};

Engine$1.prototype.bindEvents = function () {
	this.subs.push(on(this.GlobalEmitter, 'open', index$2(this, 'onopen')));
	this.subs.push(on(this.GlobalEmitter, 'close', index$2(this, 'onclose')));
	this.subs.push(on(this.GlobalEmitter, 'error', index$2(this, 'onerror')));
	this.subs.push(on(this.GlobalEmitter, 'packet', index$2(this, 'onpacket')));
};

Engine$1.prototype.destroy = function () {
	var sub = void 0;
	while (sub = this.subs.shift()) {
		sub.destroy();
	}

	clearTimeout(this.pingIntervalTimer);
	this.readyState = 'closed';
	this.id = null;
	this.writeBuffer = [];
	this.prevBufferLen = 0;

	this.wxSocketTask.close();
};

function decodePacket(data) {
	var type = data.charAt(0);
	if (data.length > 1) {
		return {
			type: packetslist[type],
			data: data.substring(1)
		};
	}
	return { type: packetslist[type] };
}

/**
 * Closes the connection.
 *
 * @api private
 */

Engine$1.prototype.close = function () {
	if ('opening' === this.readyState || 'open' === this.readyState) {
		this.readyState = 'closing';
		this.onclose('force close');
		// this.wxSocketTask.close()
	}
	return this;
};

exports.types = ['CONNECT', 'DISCONNECT', 'EVENT', 'ACK', 'ERROR', 'BINARY_EVENT', 'BINARY_ACK'];

function encoder(obj, callback) {
  // if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type)
  // TODO support binary packet
  var encoding = encodeAsString(obj);
  callback([encoding]);
}

function encodeAsString(obj) {
  var str = '';
  var nsp = false;

  str += obj.type;
  // if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {}
  // TODO support binary type

  if (obj.nsp && '/' != obj.nsp) {
    nsp = true;
    str += obj.nsp;
  }

  if (null != obj.id) {
    if (nsp) {
      str += ',';
      nsp = false;
    }
    str += obj.id;
  }

  if (null != obj.data) {
    if (nsp) str += ',';
    str += JSON.stringify(obj.data);
  }

  return str;
}

function decoder(obj, callback) {
  var packet = void 0;
  if ('string' == typeof obj) {
    packet = decodeString(obj);
  }
  callback(packet);
}

function decodeString(str) {
  var p = {};
  var i = 0;
  // look up type
  p.type = Number(str.charAt(0));
  if (null == exports.types[p.type]) return error();

  // look up attachments if type binary

  // look up namespace (if any)
  if ('/' == str.charAt(i + 1)) {
    p.nsp = '';
    while (++i) {
      var c = str.charAt(i);
      if (',' == c) break;
      p.nsp += c;
      if (i == str.length) break;
    }
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' !== next && Number(next) == next) {
    p.id = '';
    while (++i) {
      var _c = str.charAt(i);
      if (null == _c || Number(_c) != _c) {
        --i;
        break;
      }
      p.id += str.charAt(i);
      if (i == str.length) break;
    }
    p.id = Number(p.id);
  }

  // look up json data
  if (str.charAt(++i)) {
    try {
      p.data = JSON.parse(str.substr(i));
    } catch (e) {
      return error();
    }
  }
  return p;
}

function error(data) {
  return {
    type: exports.ERROR,
    data: 'parser error'
  };
}

index$1(Socket$1.prototype);

var parser = {
  CONNECT: 0,
  DISCONNECT: 1,
  EVENT: 2,
  ACK: 3,
  ERROR: 4,
  BINARY_EVENT: 5,
  BINARY_ACK: 6
};

var events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  connecting: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1,
  ping: 1,
  pong: 1
};

var emit = index$1.prototype.emit;

function Socket$1(io, nsp) {
  this.io = io;
  this.nsp = nsp;
  this.id = 0; // sid
  this.connected = false;
  this.disconnected = true;
  this.receiveBuffer = [];
  this.sendBuffer = [];
  if (this.io.autoConnect) this.open();
}

Socket$1.prototype.subEvents = function () {
  if (this.subs) return;

  var io = this.io;
  this.subs = [on(io, 'open', index$2(this, 'onopen')), on(io, 'packet', index$2(this, 'onpacket')), on(io, 'close', index$2(this, 'onclose'))];
};

Socket$1.prototype.open = Socket$1.prototype.connect = function () {
  if (this.connected) return this;
  this.subEvents();
  this.io.open(); // ensure open
  if ('open' == this.io.readyState) this.onopen();
  return this;
};

Socket$1.prototype.onopen = function () {
  if ('/' != this.nsp) this.packet({ type: parser.CONNECT });
};

Socket$1.prototype.onclose = function (reason) {
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

Socket$1.prototype.onpacket = function (packet) {
  if (packet.nsp != this.nsp) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;
    case parser.EVENT:
      this.onevent(packet);
      break;
    case parser.DISCONNECT:
      this.disconnect();
      break;
    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

Socket$1.prototype.onconnect = function () {
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  // this.emitBuffered()
};

Socket$1.prototype.onevent = function (packet) {
  var args = packet.data || [];

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.receiveBuffer.push(args);
  }
};

Socket$1.prototype.close = Socket$1.prototype.disconnect = function () {
  if (this.connected) {
    this.packet({ type: parser.DISCONNECT });
  }

  this.destroy();

  if (this.connected) {
    this.onclose('io client disconnect');
  }
  return this;
};

Socket$1.prototype.destroy = function () {
  if (this.subs) {
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }
  this.io.destroy(this);
};

Socket$1.prototype.emit = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (events.hasOwnProperty(args[0])) {
    emit.apply(this, args);
    return this;
  }

  var parserType = parser.EVENT;
  // if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
  var packet = { type: parserType, data: args, options: {} };

  if (this.connected) {
    this.packet(packet);
  } else {
    this.sendBuffer.push(packet);
  }
  return this;
};

Socket$1.prototype.packet = function (packet) {
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

var has = Object.prototype.hasOwnProperty;

index$1(Manager.prototype);

function Manager(uri, opts) {
  if (!(this instanceof Manager)) return new Manager(uri, opts);

  opts.path = opts.path || 'socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.uri = uri;
  this.readyState = 'closed';
  this.connected = false;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new index$3({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.encoder = encoder;
  this.decoder = decoder;
  this.connecting = [];
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}

Manager.prototype.open = Manager.prototype.connect = function (fn) {
  var _this = this;

  if (~this.readyState.indexOf('open')) return this;

  this.engine = new Engine$1(this.uri, this.opts);

  this.readyState = 'opening';

  var socket = this.engine;

  this.subs.push(on(socket, 'open', function () {
    _this.onopen();
    fn && fn();
  }));

  this.subs.push(on(socket, 'error', function (data) {
    _this.cleanup();
    _this.readyState = 'closed';
    _this.emitAll('connect_error', data);
    if (fn) {
      var error = new Error('Connect error');
      error.data = data;
      fn(error);
    } else {
      _this.maybeReconnectOnOpen();
    }
  }));

  socket.connect();
  return this;
};

Manager.prototype.onopen = function () {
  this.cleanup();

  this.readyState = 'open';
  this.emit('open');

  var socket = this.engine;
  this.subs.push(on(socket, 'data', index$2(this, 'ondata')));
  this.subs.push(on(socket, 'ping', index$2(this, 'onping')));
  this.subs.push(on(socket, 'pong', index$2(this, 'onpong')));
  this.subs.push(on(socket, 'error', index$2(this, 'onerror')));
  this.subs.push(on(socket, 'close', index$2(this, 'onclose')));
  // this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')))
};

Manager.prototype.onclose = function (reason) {
  this.cleanup();
  this.readyState = 'closed';
  this.emit('close', reason);
  if (this._reconnection && !this.skipReconnect) this.reconnect();
};

Manager.prototype.onerror = function (reason) {
  this.emitAll('error', reason);
};

Manager.prototype.onping = function () {
  this.lastPing = new Date();
  this.emitAll('ping');
};

Manager.prototype.onpong = function () {
  this.emitAll('pong', new Date() - this.lastPing);
};

Manager.prototype.ondata = function (data) {
  var _this2 = this;

  this.decoder(data, function (decoding) {
    _this2.emit('packet', decoding);
  });
};

Manager.prototype.packet = function (packet) {
  var _this3 = this;

  this.encoder(packet, function (encodedPackets) {
    for (var i = 0; i < encodedPackets.length; i++) {
      _this3.engine.write(encodedPackets[i], packet.options);
    }
  });
};

Manager.prototype.socket = function (nsp) {
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket$1(this, nsp);
    this.nsps[nsp] = socket;
  }
  return socket;
};

Manager.prototype.cleanup = function () {
  var sub = void 0;
  while (sub = this.subs.shift()) {
    sub.destroy();
  }this.packetBuffer = [];
  this.lastPing = null;
};

Manager.prototype.emitAll = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  this.emit.apply(this, args);
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].emit.apply(this.nsps[nsp], args);
    }
  }
};

Manager.prototype.reconnect = function () {
  var _this4 = this;

  if (this.reconnecting || this.skipReconnect) return this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    (function () {
      var delay = _this4.backoff.duration();
      _this4.reconnecting = true;
      var timer = setTimeout(function () {
        _this4.emitAll('reconnect_attempt', _this4.backoff.attempts);
        _this4.emitAll('reconnecting', _this4.backoff.attempts);

        if (_this4.skipReconnect) return;

        _this4.open(function (err) {
          if (err) {
            _this4.reconnecting = false;
            _this4.reconnect();
            _this4.emitAll('reconnect_error', err.data);
          } else {
            _this4.onreconnect();
          }
        });
      }, delay);

      _this4.subs.push({
        destroy: function destroy() {
          clearTimeout(timer);
        }
      });
    })();
  }
};

Manager.prototype.onreconnect = function () {
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function () {
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].id = this.engine.id;
    }
  }
};

Manager.prototype.destroy = function (socket) {
  var index = index$4(this.connecting, socket);
  if (~index) this.connecting.splice(index, 1);
  if (this.connecting.length) return;

  this.close();
};

Manager.prototype.close = Manager.prototype.disconnect = function () {
  this.skipReconnect = true;
  this.reconnecting = false;
  if ('opening' == this.readyState) {
    // `onclose` will not fire because
    // an open event never happened
    this.cleanup();
  }
  this.readyState = 'closed';
  if (this.engine) this.engine.close();
};

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */
Manager.prototype.reconnection = function (v) {
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */
Manager.prototype.reconnectionAttempts = function (v) {
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */
Manager.prototype.reconnectionDelay = function (v) {
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function (v) {
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */
Manager.prototype.reconnectionDelayMax = function (v) {
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */
Manager.prototype.timeout = function (v) {
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */
Manager.prototype.maybeReconnectOnOpen = function () {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};

var url = (function (uri) {
  var obj = index$5(uri);

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';
  var ipv6 = obj.host.indexOf(':') !== -1;
  var host = ipv6 ? '[' + obj.host + ']' : obj.host;

  // define unique id
  obj.id = obj.protocol + '://' + host + ':' + obj.port;

  return obj;
});

var cache = {};

function lookup(uri, opts) {
  if (!uri) {
    throw new Error('uri is required.');
  }

  opts = opts || {};

  var parsed = url(uri);

  var source = parsed.source;
  var id = parsed.id;
  var path = parsed.path;
  var sameNamespace = cache[id] && path in cache[id].nsps;

  var newConnection = opts.forceNew || opts['force new connection'] || false === opts.multiplex || sameNamespace;

  // return new socket or from cache
  var io = void 0;
  if (newConnection) {
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }
  return io.socket(parsed.path);
}

module.exports = lookup;
