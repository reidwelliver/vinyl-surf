//server.js
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');



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

http.listen(1338, function(){
  console.log('listening on localhost:1338');
});