function Chat(opts){
	var thisChat = this;
	thisChat.id = opts.id || 0;

	this.init = function(){
		thisChat.elems = {
			messageBox: $("#chat-box"),
			inputBox: $("#chat-input")
		}

		console.log("elems", $("#chat-input"));

		thisChat.user = new User({
			nick: ("user" + Math.floor(Math.random() * (100 - 1)) + 1)
		})

		//send chat message on return key
		thisChat.elems.inputBox.keyup( function(ev){
			if(ev.keyCode === 13) {
				console.log("enter key pressed");
				thisChat.sendMessage();
			}
		});

		messages.subscribe('chat'+thisChat.id,function(message){
			console.log('f?!?!?',message);
			thisChat.receiveMessage(message);
		});
	}

	this.getInputBoxContents = function(){
		return thisChat.elems.inputBox.val();
	}

	this.clearInputBoxContents = function(){
		return thisChat.elems.inputBox.val("");
	}

	this.sendMessage = function(){
		var message = {
			user: thisChat.user,
			message: thisChat.getInputBoxContents()
		};

		console.log("emitting chat message", message);
		messages.publish('chat'+thisChat.id, message);

		thisChat.clearInputBoxContents();
	}

	this.receiveMessage = function(message){
		var template =  $('<tr>').text(message.user.nick + ": " + message.message);
		thisChat.elems.messageBox.append(template);
		$("#chat-box").scrollTop($("#chat-box")[0].scrollHeight);
	}

	thisChat.init();
}


function User(opts){
	var thisUser = this;

	this.init = function(){
		thisUser.nick = opts.nick || "bob";
	}

	this.init();
}

window.chat = new Chat({id:0});
