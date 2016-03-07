/*
function Chat(optsIn){
	var thisChat = this;

	this.init = function(opts){
		thisChat.elems = {
			messageBox: $("#chatcontainer"),
			inputBox: $("#chatinput")
		}

		thisChat.user = new User({
			nick: "bob"
		})

		//send chat message on return key
		thisChat.elems.inputBox.keyup( function(ev){
			if(ev.keyCode === 13) {
				console.log("enter key pressed")
				thisChat.sendMessage();
			}
		});

		thisChat.id = opts.id || 0;

		thisChat.socket = opts.socket || io.connect(':12381/chat/'+thisChat.id);
	}

	this.getInputBoxContents = function(){
		return thisChat.elems.inputBox.value;
	}

	this.sendMessage = function(){
		var message = {
			user: thisChat.user,
			message: thisChat.getInputBoxContents()
		};

		console.log("emitting chat message");
		thisChat.socket.emit('message', {
			data: message
		});

	}

	this.receiveMessage = function(message){
		var template =
			'<tr>' +
				'<td class="chat-user-username">' + message.user.nick + '</td>' +
				'<td class="chat-user-message">'  + message.text + '</td>' +
			'</tr>'
		;

		console.log("inserting chat message");
		console.log(template);
		thisChat.elems.messageBox.appendChild(template);
	}

	thisChat.init(optsIn);
}


function User(optsIn){
	var thisUser = this;

	this.init = function(opts){
		thisUser.nick = opts.nick || "bob";
	}
}


var chat = new Chat({id: 0});
*/

messages = new stomp({
	endpoint: 'ws://vinyl.surf:15674/stomp/websocket',
	user: 'vinyl-surf',
	pass: 'vinyl-surf'
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
