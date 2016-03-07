import { EventEmitter } from 'events';
import Stomp from 'stompjs';
import NodeWebSocket from 'ws';


export default class PielSTOMP extends EventEmitter {

	/**
		Constructor.

		@param { Object } props the properties object.
		@param { string } props.endpoint the STOMP service endpoint
		@param { string } props.user
		@param { string } props.pass
		@param { string } props.mode whether to run in client (browser) or server (node) mode

	**/
	constructor( props ) {

		super( props );

		props = props || {};
		this.props = props;

		this.bindMethods();
		this.setInitialState();

	}

	bindMethods() {

	}

	setInitialState() {

		this.state = {
			connected: false,
			subscriptions : {}
		};

	}

	/**
		Connect the stomp service.

		@param Function callback - OPTIONAL a Callback when connected.

		@return Promise resolves true when connected
	**/
	connect( callback ){

		return new Promise( ( resolve, reject ) => {

			var ws;

			if(this.props.mode === 'server'){
				ws = new NodeWebSocket( this.props.endpoint );
			} else {
				this.props.mode = 'client';
				ws = new WebSocket( this.props.endpoint );
			}


			this.client = Stomp.over( ws );
			if( !this.props.debug ) this.client.debug = null;

			this.client.connect(
				this.props.user,
				this.props.pass,
				() => {
					this.state.connected = true;
					this.emit( 'connected' );
					if( callback && typeof callback === 'function' )
						callback();
					resolve( true );
				},
				( err ) => {
					this.emit( 'error' );
					reject( err );
					console.log( err.headers.message );
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
	invoke( queue, message, callback, options ) {

		return new Promise( ( resolve, reject ) => {

			options = options || {};
			options[ 'durable' ] = options.durable || false;
			options[ 'auto-delete' ] = options.autoDelete || false;
			options[ 'exclusive' ] = options.exclusive || false;

			if( typeof message === 'object' )
				message = JSON.stringify( message );

			var responseQueue = 'RESP-' + parseInt( Math.random() * 10000000, 10 );
			options[ 'requeue' ] = responseQueue;

			this.client.subscribe( '/queue/' + responseQueue, ( frame ) => {

				var response;
				if( frame.body && ( typeof frame.body === 'string' ) && ( frame.body.length > 2 ) )
					response = JSON.parse( frame.body );

				if( callback && typeof callback === 'function' )
					callback( response );

				resolve( response );

			});

			this.client.send( '/queue/' + queue, options, message );

		});
	}


	/**
		Provide a method in an RPC ( REST-LIKE ) means.
		in other words, advertise as an endpoint

		@param String queue - the name of the queue youd like provide a service for
		@param Function callback - a callback to bind to requests of this type - recieves parameters: ( message, options, responsecallback	)

		@return Promise - resolves with the JSON parsed reponse from the server.
	**/
	provide( queue, callback ) {
		return new Promise( ( resolve, reject ) => {
			this.client.subscribe( '/queue/' + queue, ( frame ) => {
				var message, options;

				if( frame.body && ( typeof frame.body === 'string' ) && ( frame.body.length > 2 ) )
					message = JSON.parse( frame.body );

				options = frame.headers || {}; //get headers/options from the request, I.E. reply-to queue


				if( callback && typeof callback === 'function' )
					callback( message, options, this.respond );
			});

			resolve({
				"success" : true,
				"queue" : queue
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
	respond( message, options ) {
		return new Promise( ( resolve, reject ) => {
			if( typeof message === 'object' )
				message = JSON.stringify( message );

			if( ! options[ 'requeue' ] )
				reject({
					"error": "invalid reply-to queue"
				});

			this.client.send( '/queue/' + options[ 'requeue' ], {}, message );

			resolve({
				"success": true
			})
		});
	}


	/**
		Unsubscribe from a topic.

		@param String topic the topic to subscribe/listen to.
		@param Function callback
		@param Object options the options object

		@return Promise returns true if successfully subscribed
	**/
	subscribe( topic, callback, options ) {
			return new Promise( ( resolve, reject ) => {

				options = options || {};
				options[ 'durable' ] = options.durable || true; //this makes the subscription durable, not the topic
				options[ 'auto-delete' ] = options.autoDelete || false;

				this.state.subscriptions = this.state.subscriptions || {};
				this.state.subscriptions[topic] = this.client.subscribe( '/topic/' + topic, ( frame ) => {
					var message;
					if( frame.body && ( typeof frame.body === 'string' ) && ( frame.body.length > 2 ) )
						message = JSON.parse( frame.body );
					if( callback && typeof callback === 'function' )
						callback( message );
				});

				resolve({
					"success" : true,
					"topic" : topic //TODO: maybe replace with uniquely created queue id instead
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
	unsubscribe( topic, callback, options ) {

		options = options || {};

		return new Promise( ( resolve, reject ) => {

			var err;

			if( this.state.subscriptions[ topic ] ) {

				//would love to validate server confirmation that the client is no longer participating
				//on the topic but stompjs offers nothing. We could provide an option which also checks.
				this.state.subscriptions[ topic ].unsubscribe();
				delete this.state.subscriptions[ topic ];

			} else
				console.warn( 'piel-stomp:: unsubscribe was performed against a non-existent topic [ ' + topic + ' ]' );

			if( callback && typeof callback === 'function' )
				callback( err );

			resolve( true );

		});
	}

	/**
		Publish a message to a topic, erroring if the queue doesn't exist ( if a queue doesnt exist, nothing is listening to it anyway )
		right now this doesn't check for queue existance, as I haven't found a way to do that with STOMP.
		a lead might be to use dead-letter routing, but I don't know if that will work yet...
		@todo Reid..
	**/
	publish( topic, message, options ) {
		options = options || {};
		return new Promise( ( resolve, reject ) => {
			if( typeof message === 'object' )
				message = JSON.stringify( message );
				this.client.send( '/topic/' + topic, options, message );

			resolve({
				"success": true
			});
		});
	}
}

module.exports = PielSTOMP;
