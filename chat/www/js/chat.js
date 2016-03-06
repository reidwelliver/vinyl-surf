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