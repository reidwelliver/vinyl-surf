'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _stompjs = require('stompjs');

var _stompjs2 = _interopRequireDefault(_stompjs);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PielSTOMP = function (_EventEmitter) {
	_inherits(PielSTOMP, _EventEmitter);

	/**
 	Constructor.
 		@param { Object } props the properties object.
 	@param { string } props.endpoint the STOMP service endpoint
 	@param { string } props.user
 	@param { string } props.pass
 	@param { string } props.mode whether to run in client (browser) or server (node) mode
 	**/

	function PielSTOMP(props) {
		_classCallCheck(this, PielSTOMP);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PielSTOMP).call(this, props));

		props = props || {};
		_this.props = props;

		_this.bindMethods();
		_this.setInitialState();

		return _this;
	}

	_createClass(PielSTOMP, [{
		key: 'bindMethods',
		value: function bindMethods() {}
	}, {
		key: 'setInitialState',
		value: function setInitialState() {

			this.state = {
				connected: false,
				subscriptions: {}
			};
		}

		/**
  	Connect the stomp service.
  		@param Function callback - OPTIONAL a Callback when connected.
  		@return Promise resolves true when connected
  **/

	}, {
		key: 'connect',
		value: function connect(callback) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {

				var ws;

				if (_this2.props.mode === 'server') {
					ws = new _ws2.default(_this2.props.endpoint);
				} else {
					_this2.props.mode = 'client';
					ws = new WebSocket(_this2.props.endpoint);
				}

				_this2.client = _stompjs2.default.over(ws);
				if (!_this2.props.debug) _this2.client.debug = null;

				_this2.client.connect(_this2.props.user, _this2.props.pass, function () {
					_this2.state.connected = true;
					_this2.emit('connected');
					if (callback && typeof callback === 'function') callback();
					resolve(true);
				}, function (err) {
					_this2.emit('error');
					reject(err);
					console.log(err.headers.message);
				});
			});
		}

		/**
  	Invoke a method in an RPC ( REST-LIKE ) means.
  		@param String queue - the name of the queue youd like to invoke
  	@param Object message - the props object for this invocation. eg { username: 'bren', password: 'mypass' }
  	@param Function callback - OPTIONAL, a callback to fire with the response ; the response will be JSON parsed
  	@param Object options - OPTIONAL header options to pass on with your STOMP request - see https://www.rabbitmq.com/stomp.html for details
  		@return Promise - resolves with the JSON parsed reponse from the server.
  **/

	}, {
		key: 'invoke',
		value: function invoke(queue, message, callback, options) {
			var _this3 = this;

			return new Promise(function (resolve, reject) {

				options = options || {};
				options['durable'] = options.durable || false;
				options['auto-delete'] = options.autoDelete || true;
				options['exclusive'] = options.exclusive || false;

				if ((typeof message === 'undefined' ? 'undefined' : _typeof(message)) === 'object') message = JSON.stringify(message);

				var responseQueue = 'RESP-' + parseInt(Math.random() * 10000000, 10);
				options['requeue'] = responseQueue;

				_this3.client.subscribe('/queue/' + responseQueue, function (frame) {

					var response;
					if (frame.body && typeof frame.body === 'string' && frame.body.length > 2) response = JSON.parse(frame.body);

					if (callback && typeof callback === 'function') callback(response);

					resolve(response);
				});

				_this3.client.send('/queue/' + queue, options, message);
			});
		}

		/**
  	Provide a method in an RPC ( REST-LIKE ) means.
  	in other words, advertise as an endpoint
  		@param String queue - the name of the queue youd like provide a service for
  	@param Function callback - a callback to bind to requests of this type - recieves parameters: ( message, options, responsecallback	)
  		@return Promise - resolves with the JSON parsed reponse from the server.
  **/

	}, {
		key: 'provide',
		value: function provide(queue, callback) {
			var _this4 = this;

			return new Promise(function (resolve, reject) {
				_this4.client.subscribe('/queue/' + queue, function (frame) {
					var message, options;

					if (frame.body && typeof frame.body === 'string' && frame.body.length > 2) message = JSON.parse(frame.body);

					options = frame.headers || {}; //get headers/options from the request, I.E. reply-to queue

					if (callback && typeof callback === 'function') callback(message, options, _this4.respond);
				});

				resolve({
					"success": true,
					"queue": queue
				});
			});
		}

		/**
  	todo: unprovide
  	**/

		/**
  	respond in an RPC ( REST-LIKE ) means.
  	Passed as a parameter to callback of provide for convenience
  		@param Object message - the props object for this invocation. eg { username: 'bren', password: 'mypass' }
  	@param Object options - OPTIONAL header options to pass on with your STOMP request - see https://www.rabbitmq.com/stomp.html for details
  		@return Promise - resolves with the JSON parsed reponse from the server.
  **/

	}, {
		key: 'respond',
		value: function respond(message, options) {
			var _this5 = this;

			return new Promise(function (resolve, reject) {
				if ((typeof message === 'undefined' ? 'undefined' : _typeof(message)) === 'object') message = JSON.stringify(message);

				if (!options['requeue']) reject({
					"error": "invalid reply-to queue"
				});

				_this5.client.send('/queue/' + options['requeue'], {}, message);

				resolve({
					"success": true
				});
			});
		}

		/**
  	Unsubscribe from a topic.
  		@param String topic the topic to subscribe/listen to.
  	@param Function callback
  	@param Object options the options object
  		@return Promise returns true if successfully subscribed
  **/

	}, {
		key: 'subscribe',
		value: function subscribe(topic, callback, options) {
			var _this6 = this;

			return new Promise(function (resolve, reject) {

				options = options || {};
				options['durable'] = options.durable || true; //this makes the subscription durable, not the topic
				options['auto-delete'] = options.autoDelete || false;

				_this6.state.subscriptions = _this6.state.subscriptions || {};
				_this6.state.subscriptions[topic] = _this6.client.subscribe('/topic/' + topic, function (frame) {
					var message;
					if (frame.body && typeof frame.body === 'string' && frame.body.length > 2) message = JSON.parse(frame.body);
					if (callback && typeof callback === 'function') callback(message);
				});

				resolve({
					"success": true,
					"topic": topic //TODO: maybe replace with uniquely created queue id instead
				});
			});
		}

		/**
  	Unsubscribe from a topic.
  		@param String topic the topic to unsubscribe/stop listening to.
  	@param Function callback
  	@param Object options the options object
  	@param Object options.confirm, set true to check you are unsubscribed with the server. This costs performance to the server to confirm unsubscription but pays off with a garentee.
  		@return Promise returns true if successfully unsubscribed, OR if the subscription didn't exist in the first place ( we don't want to hard error , although we do want to warn in this case )
  **/

	}, {
		key: 'unsubscribe',
		value: function unsubscribe(topic, callback, options) {
			var _this7 = this;

			options = options || {};

			return new Promise(function (resolve, reject) {

				var err;

				if (_this7.state.subscriptions[topic]) {

					//would love to validate server confirmation that the client is no longer participating
					//on the topic but stompjs offers nothing. We could provide an option which also checks.
					_this7.state.subscriptions[topic].unsubscribe();
					delete _this7.state.subscriptions[topic];
				} else console.warn('piel-stomp:: unsubscribe was performed against a non-existent topic [ ' + topic + ' ]');

				if (callback && typeof callback === 'function') callback(err);

				resolve(true);
			});
		}

		/**
  	Publish a message to a topic, erroring if the queue doesn't exist ( if a queue doesnt exist, nothing is listening to it anyway )
  	right now this doesn't check for queue existance, as I haven't found a way to do that with STOMP.
  	a lead might be to use dead-letter routing, but I don't know if that will work yet...
  	@todo Reid..
  **/

	}, {
		key: 'publish',
		value: function publish(topic, message, options) {
			var _this8 = this;

			options = options || {};
			return new Promise(function (resolve, reject) {
				if ((typeof message === 'undefined' ? 'undefined' : _typeof(message)) === 'object') message = JSON.stringify(message);
				_this8.client.send('/topic/' + topic, options, message);

				resolve({
					"success": true
				});
			});
		}
	}]);

	return PielSTOMP;
}(_events.EventEmitter);

exports.default = PielSTOMP;


module.exports = PielSTOMP;
