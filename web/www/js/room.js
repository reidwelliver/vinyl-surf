/*
function loadChat(){
	$.ajax("chat/index.html",{
		type:"GET",
		dataFilter: null,
		dataType: "html",
		converters: {},
		success:function(data, textStatus, jqXHR) {
      $("#chat-wrap").html(data);
      console.log('success-chat');
      componentHandler.upgradeAllRegistered();
    },
		error: function(jqXHR, textStatus, errorThrown) {console.log("failure",errorThrown);}
	});
}
	if(!window.chat){
			loadChat();
	}
*/

function YoutubePlayer(optsIn, readyCallback){
	var thisPlayer = this;

	this.init = function(opts){
		thisPlayer.initFrame(opts);
	};

	this.initFrame = function(opts){
		var tubOpts = {
        ratio: 16/9, // usually either 4/3 or 16/9 -- tweak as needed
        videoId: 'ZCAnLxRvNNc', // toy robot in space is a good default, no?
        mute: false,
        repeat: true,
        width: $(window).width(),
        wrapperZIndex: 99,
        playButtonClass: 'tubular-play',
        pauseButtonClass: 'tubular-pause',
        muteButtonClass: 'tubular-mute',
        volumeUpClass: 'tubular-volume-up',
        volumeDownClass: 'tubular-volume-down',
        increaseVolumeBy: 10,
        start: 0
    };

		$('#youtube-frame').tubular(tubOpts);
	};

	this.seekTo = function(seconds){
		console.log("seeking to second " + seconds);
		window.player.seekTo(seconds, true);
		window.player.playVideo();
	}

	this.queue = function(track){
		console.log("queueing");
		track.queued = true;
		//window.player.cueVideoById(track.videoId);
	}

	this.playNow = function(track){
		console.log("playing");
		window.player.loadVideoById(track.videoId);
		window.player.playVideo();

	}

	this.getCurrentTime = function(){
		return window.player.getCurrentTime();
	}

	this.getCurrentVideoURL = function(){
		return window.player.getVideoUrl();
	}

	this.init(optsIn);
};


function Room(opts){
	var thisRoom = this;

	this.init = function(){
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

		thisRoom.isPaused = false;

		opts.players = opts.players || {};

		var youtubePlayerCallback = function(){
			console.log("calling player callback");
			thisRoom.playerReady = true;
		}

		thisRoom.players = {
			YT: new YoutubePlayer(opts.players.YT, youtubePlayerCallback)
		}

		window.messages.subscribe('room-' + thisRoom.id + '-update', function(data){
			//console.log("trackUpdate callback reached");
			console.log('update',data);
			thisRoom.receiveTrackUpdate(data);
		});

		window.messages.subscribe('room-' + thisRoom.id + '-next', function(data){
			//console.log("nextTrack callback reached");
			console.log('next',data);
			thisRoom.receiveNextTrack(data);
		});

		window.messages.subscribe('room-' + thisRoom.id + '-start', function(data){
			//console.log("trackStart callback reached");
			console.log('next',data);
			thisRoom.receiveTrackUpdate(data);
		});

		//socket callbacks - move these eventually
		window.messages.invoke('room-load',{id: thisRoom.id},function(data){
			console.log('load',data);
			thisRoom.receiveFirstLoad(data);
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

	this.togglePlay = function(){
		this.isPaused = !this.isPaused;
		console.log("toggling play...");
		if(this.isPaused){
			$('#play-button-icon').html("play_circle_filled");
			window.player.pauseVideo();
		} else {
			$('#play-button-icon').html("pause_circle_filled");
			window.player.playVideo();
		}
	}


	this.receiveTrackUpdate = function(track){
		thisRoom.whenPlayerReady(function(track){
			console.log('updating track');
			if(thisRoom.players[track.player].getCurrentVideoURL().indexOf(track.videoId) === -1){
				thisRoom.currentTrack = new Track(track);
				thisRoom.players[track.player].playNow(track);
				thisRoom.updateTrackBar();
			}

			var difference = (track.currentTime - thisRoom.getCurrentTrackTime()) - ((Date.now()/1000) - track.stamp);

			if( !thisRoom.isPaused && ( difference > 2 || difference < -2 ) && thisRoom.players.hasOwnProperty(track.player)){
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

	thisRoom.init();
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




function YTTest(){
	YoutubeInfo('https://www.youtube.com/watch?v=PApxRlpvsIU');
}















$(document).ready(function(){
	console.log("room time!")
	window.room = new Room({id:0});
})
