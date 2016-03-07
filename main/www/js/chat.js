function Chat(opts){
	var thisChat = this;
	thisChat.id = opts.id || 0;

	this.init = function(){
		thisChat.elems = {
			messageBox: $("#chat-container"),
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
		var template =
			'<tr>' +
				'<td class="mdl-data-table__cell--non-numeric chat-user-username">' + message.user.nick + '</td>' +
				'<td class="mdl-data-table__cell--non-numeric chat-user-message">'  + message.message + '</td>' +
			'</tr>'
		;

		thisChat.elems.messageBox.append(template);
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
