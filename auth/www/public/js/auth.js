function Authentication(readyCallback) {
    var thisAuth = this;
    var token = "";
    
    
    this.init = function() {
        thisAuth.socket = io.connect("192.168.99.100:11337/auth");
        thisAuth.socket.on('connect', function(socket) {
            console.log('Connected!');
        });
        
        thisAuth.socket.on('Token', function(data) {
            if (data.token == undefined) {
                console.log("Login failed!");
                return;
            }
            console.log('Received token', data.token);
            thisAuth.token = data.token;
        });
        
    }
    this.login = function() {
        thisAuth.socket.emit('Login', {
			username: $("#login-username").val(), password: $("#login-password").val()
		});   
    }
    thisAuth.init();
}


function YoutubePlayer(optsIn, readyCallback){
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
				width: '640',
				videoId: 'dQw4w9WgXcQ',
				events: {}
			});

			console.log("loaded YoutubePlayer!");
			readyCallback();
		};
	};

	this.seekTo = function(seconds){
		console.log("seeking to second " + seconds);
		thisPlayer.player.seekTo(seconds, true);
		thisPlayer.player.playVideo();
	}

	this.queue = function(track){
		console.log("queueing");
		track.queued = true;
		//thisPlayer.player.cueVideoById(track.videoId);
	}

	this.playNow = function(track){
		console.log("playing");
		thisPlayer.player.loadVideoById(track.videoId);
		thisPlayer.player.playVideo();

	}

	this.getCurrentTime = function(){
		return thisPlayer.player.getCurrentTime();
	}

	this.getCurrentVideoURL = function(){
		return thisPlayer.player.getVideoUrl();
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

		thisRoom.socket = opts.socket || io.connect(":12381/auth");

		opts.players = opts.players || {};

		var youtubePlayerCallback = function(){
			console.log("calling player callback");
			thisRoom.playerReady = true;
		}

		thisRoom.players = {
			YT: new YoutubePlayer(opts.players.YT, youtubePlayerCallback)
		}

		//socket callbacks - move these eventually
		thisRoom.socket.on('firstLoad', function(data){
			//console.log("Firstload callback reached");	
			//console.log(data.data);
			thisRoom.receiveFirstLoad(data.data);
		});

		thisRoom.socket.on('trackUpdate', function(data){
			//console.log("trackUpdate callback reached");
			//console.log(data.data);
			thisRoom.receiveTrackUpdate(data.data);
		});

		thisRoom.socket.on('nextTrack', function(data){
			//console.log("nextTrack callback reached");
			//console.log(data.data);
			thisRoom.receiveNextTrack(data.data);
		});

		thisRoom.socket.on('trackStart', function(data){
			//console.log("trackStart callback reached");
			//console.log(data.data);
			thisRoom.receiveTrackUpdate(data.data);
		});
	};

	this.getCurrentTrackTime = function(){
		return thisRoom.players["YT"].getCurrentTime();
	}

	this.receiveFirstLoad = function(track){
		thisRoom.whenPlayerReady(function(track){
			if(thisRoom.players.hasOwnProperty(track.player)){
				thisRoom.currentTrack = new Track(track);
				thisRoom.players[track.player].playNow(track);
				thisRoom.updateTrackBar();
			}
		}, track);
	};

	this.receiveTrackUpdate = function(track){
		thisRoom.whenPlayerReady(function(track){
			if(thisRoom.players[track.player].getCurrentVideoURL().indexOf(track.videoId) === -1){
				thisRoom.currentTrack = new Track(track);
				thisRoom.players[track.player].playNow(track);
				thisRoom.updateTrackBar();
			}

			var difference = (track.currentTime - thisRoom.getCurrentTrackTime()) - ((Date.now()/1000) - track.stamp);

			if( ( difference > 1 || difference < -1 ) && thisRoom.players.hasOwnProperty(track.player)){
				thisRoom.players[track.player].seekTo(track.currentTime);
				thisRoom.updateTrackBar();
			}
		}, track);
	};

	this.receiveNextTrack = function(track){
		thisRoom.whenPlayerReady(function(track){
			if(thisRoom.nextTrack.id != track.id && thisRoom.players.hasOwnProperty(track.player)){
				thisRoom.nextTrack = new Track(track);
				thisRoom.players[thisRoom.nextTrack.player].queue(thisRoom.nextTrack);
			}
		}, track);
	};

	this.whenPlayerReady = function(callback, params){
		if(!thisRoom.playerReady){
			console.log("waiting for player to be ready");
			setTimeout(thisRoom.whenPlayerReady,200,callback,params);
		}
		else{
			callback(params);
		}
	}

	this.updateTrackBar = function(){
		var span = thisRoom.currentTrack.name + "<br>" + thisRoom.currentTrack.artist;
		$("#trackinfo").html(span);
	}

	thisRoom.init(optsIn);
};


function Track(optsIn){
	var thisTrack = this;

	this.init = function(opts){
		opts = opts || {};
		thisTrack.artist = opts.artist || "";
		thisTrack.name = opts.name || "";

		thisTrack.videoId = opts.videoId || "";
		thisTrack.player = opts.player || "YT";

		thisTrack.playTime = opts.length || 0;
		thisTrack.timeStarted = 0;

		thisTrack.queued = false;
	};

	thisTrack.init(optsIn);
};

var auth = new Authentication({});