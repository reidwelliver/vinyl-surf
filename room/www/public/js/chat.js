function Chat(optsIn){
	var thisChat = this;

	this.init = function(opts){
		thisChat.elems = {
			messageBox: $(".chat-messagebox"),
			inputBox: $(".chat-inputbox")
		}

		thisChat.user = new User({
			nick: "bob"
		})

		//send chat message on return key
		inputBox.keyup( function(ev){
			if(ev.keyCode === 13) {
				thisChat.sendMessage();
			}
		});

		thisChat.id = opts.id || 0;

		thisChat.socket = opts.socket || io.connect(':12382/chat/'+thisChat.id);
	}

	this.getInputBoxContents = function(){
		return inputBox.value;
	}

	this.sendMessage = function(){
		var message = {
			user: thisChat.user,
			message: thisChat.getInputBoxContents()
		};

		thisChat.socket.emit('message', {
			data: message
		});

	}

	this.receiveMessage = function(message){
		var template =
			"<div class='message'>"+
				message.user + ": " + message.text +
			"</div>"
		;

		thisChat.elems.messageBox.appendChild(template);
	}


}

function User(optsIn){
	var thisUser = this;

	this.init = function(opts){
		thisUser.nick = opts.nick || "bob";
	}
}