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
			connected: false
		};

	}

	/**
		Connect the stomp service.

		@param Object props The properties object
		@param String props.endpoint The endpoint for this MQ connection ( eg. 'ws://services.piel.io/stomp/websocket' )
		@param String props.user - the user for this connection
		@param String props.pass - the password for this connection

		@param Function callback a Callback when connected.

		@return Promise resolves true when connected
	**/
	connect( props, callback ){

		return new Promise( ( resolve, reject ) => {

			var ws;

			if(this.props.mode === 'service'){
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
		@param Object options - OPTIONAL, no in use just yet.

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

			var responseQueue = 'REQ-' + parseInt( Math.random() * 10000000, 10 );
			options[ 'reply-to' ] = responseQueue;

			this.client.subscribe( '/queue/' + responseQueue, ( frame ) => {

				var response;
				if( frame.body && ( typeof frame.body === 'string' ) && ( frame.body.length > 2 ) )
					response = JSON.parse( frame.body );

				if( callback && typeof callback === 'function' )
					callback( response );

				resolve( response );

			});

			this.client.send( '/queue/' + queue + '-service', options, message );

		});
	}


	respond( queue, message, options ) {
		return new Promise( ( resolve, reject ) => {
			if( typeof message === 'object' )
				message = JSON.stringify( message );

			if( ! options[ 'reply-to' ] )
				reject({
					"error": "invalid reply-to queue"
				});

			this.client.send( '/queue/' + options[ 'reply-to' ], options, message );

			resolve({
				"success": true
			})
		});
	}

	/**
		Subscribe to a message queue, creating the queue response
	**/
	subscribe( queue, callback, options ) {
			return new Promise( ( resolve, reject ) => {

				options = options || {};
				options[ 'durable' ] = options.durable || false;
				options[ 'auto-delete' ] = options.autoDelete || false;
				options[ 'exclusive' ] = options.exclusive || false;

				//e.g. /queue/bob-service or /queue/bob-client
				this.client.subscribe( ('/queue/' + queue + '-' + this.props.mode) , ( frame ) => {
					var message;
					if( frame.body && ( typeof frame.body === 'string' ) && ( frame.body.length > 2 ) )
						message = JSON.parse( frame.body );
						console.log("received message!");
					if( callback && typeof callback === 'function' )
						callback( message );
				});

				resolve({
					"success" : true,
					"queue" : queue
				});
			});
		}

	/**
		Publish a message to a queue, erroring if the queue doesn't exist ( if a queue doesnt exist, nothing is listening to it anyway )

		@todo Reid..
	**/
	publish( queue, message, options ) {
		options = options || {};
		return new Promise( ( resolve, reject ) => {
			if( typeof message === 'object' )
				message = JSON.stringify( message );
				console.log('publishing message');
				this.client.send( '/queue/' + queue, options, message );

			resolve({
				"success": true
			});
		});
	}
}
