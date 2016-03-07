messages = new stomp({
	endpoint: 'ws://vinyl.surf:15674/stomp/websocket',
	user: 'vinyl-surf',
	pass: 'vinyl-surf',
	mode: 'server'
});

//console.log(messages);
messages.connect(function(){
	console.log("connected!");
	messages.subscribe('Room-1234',function(message){
		console.log(message);
	});

	messages.provide('wft', function(message, options, respondMethod){
		console.log('doubling server side');
		var output = message.data * 2;
		messages.respond({data:output},options);
	});


	setTimeout(function(){
		console.log('doubling 2 on queue');
		messages.invoke('wft', {data: 2}, function(response){
			console.log('doubling service returned '+response.data+' with input of 2');
		},{});
	},2000);

	setTimeout(function(){
		messages.publish('Room-1234',{"data":"hi guys!"});
	},1000);
});

setTimeout(function(){
	console.log(messages.state);
},5000);


//server.js
function Chat(optsIn){
	var thisChat = this;

	this.init = function(opts){
		this.id = opts.id || 0;

		thisChat.socket = opts.socket || io.of('/chat/'+thisChat.id);

		thisChat.socket.on('connection', function(socket){
			console.log("client connected to chat ");

			socket.on('message', function(message){
				thisChat.receiveMessage(message);
			});
		});
	}

	this.getInputBoxContents = function(){
		return inputBox.value;
	}

	this.sendMessage = function(message){
		thisChat.socket.emit('message', message);

	}

	this.receiveMessage = function(message){
		thisChat.sendMessage(message);
	}

	thisChat.init(optsIn);
}

var testChat = new Chat({id: 0});
