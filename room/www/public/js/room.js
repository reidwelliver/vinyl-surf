function YoutubePlayer(optsIn){
	var thisPlayer = this;

	this.init = function(opts){
		thisPlayer.initFrame(opts);
	};

	this.initFrame = function(opts){
		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		window.onYouTubeIframeAPIReady = function() {
			thisPlayer.player = new YT.Player('player', {
				height: '390',
				width: '640'
			});

			//thisRoom.playerReady = true;

			console.log("loaded YoutubePlayer!");
		};
	};

	this.seekTo = function(seconds){
		console.log("seeking");
		thisPlayer.player.seekTo(seconds, true);
	}

	this.queue = function(track){
		console.log("queueing");
		track.queued = true;
		thisPlayer.player.cueVideoByUrl(track.url);
	}

	this.playNow = function(track){
		console.log("playing");
		thisPlayer.player.loadVideoByUrl(track.url);
	}

	this.init(optsIn);
};


function Room(optsIn){
	var thisRoom = this;

	this.init = function(opts){
		opts = opts || {};
		thisRoom.name = opts.name || "";
		thisRoom.id = opts.id || 0;

		thisRoom.queues = opts.queues || [];
		thisRoom.dj = opts.dj || "";
		thisRoom.users = opts.users || [];

		thisRoom.currentTrack = "";
		thisRoom.currentPlayer = "";

		thisRoom.nextTrack = "";
		thisRoom.nextPlayer = "";

		thisRoom.currentQueue = thisRoom.queues[0] || [];
		thisRoom.currentQueuePos = 0;

		thisRoom.socket = opts.socket || io.connect(':12381/room/'+thisRoom.id);

		opts.players = opts.players || {};
		thisRoom.players = {
			YT: new YoutubePlayer(opts.players.YT)
		}

		//socket callbacks - move these eventually
		thisRoom.socket.on('firstLoad', function(data){
			console.log("Firstload callback reached");	
			thisRoom.receiveFirstLoad(data.data);
		});

		thisRoom.socket.on('trackUpdate', function(data){
			console.log("trackUpdate callback reached");
			thisRoom.receiveTrackUpdate(data.data);
		});

		thisRoom.socket.on('nextTrack', function(data){
			console.log("nextTrack callback reached");
			thisRoom.receiveNextTrack(data.data);
		});
	};

	this.receiveFirstLoad = function(track){
		if(thisRoom.players.hasOwnProperty(track.player)){
			thisRoom.players[track.player].playNow(track);
		}
	};

	this.receiveTrackUpdate = function(track){
		thisRoom.playerReadyWait();
		var difference = (track.time - thisRoom.currentTrack.currentTrack) - ((Date.now()/1000) - track.stamp)
		if( difference > 1 || difference < 1 && thisRoom.players.hasOwnProperty(track.player)){
			thisRoom.players[track.player].seekTo(track.currentTime);
		}
	};

	this.receiveNextTrack = function(track){
		thisRoom.playerReadyWait();
		if(thisRoom.nextTrack.id != track.id && thisRoom.players.hasOwnProperty(track.player)){
			thisRoom.nextTrack = new Track(track);
			thisRoom.players[tempTrack.player].queue(thisRoom.nextTrack);
		}
	};

	this.whenPlayerReady = function(callback, params){
		if(!thisRoom.playerReady){
			console.log("waiting for player to be ready");
			setInterval(thisRoom.whenPlayerReady,500,callback,params);
		}
		else{
			callback(params);
		}
	}

	thisRoom.init(optsIn);
};


function Track(optsIn){
	var thisTrack = this;

	this.init = function(opts){
		opts = opts || {};
		thisTrack.artist = opts.artist || "";
		thisTrack.name = opts.name || "";

		thisTrack.url = opts.url || "";
		thisTrack.player = opts.player || "YT";

		thisTrack.playTime = opts.length || 0;
		thisTrack.currentTime = 0;
		thisTrack.timeStarted = 0;

		thisTrack.queued = false;
	};

	this.getUpdate = function(){
		return {
			name: thisTrack.name,
			stamp: (Date.now()/1000),
			time: thisTrack.currentTime 
		};
	};

	this.getInfo = function(){
		return thisTrack;
	};

	thisTrack.init(optsIn);
};

var room = new Room({});