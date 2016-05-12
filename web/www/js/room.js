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

		window.messages.subscribe('room-' + thisRoom.id + '-queue-add', function(data){
			//console.log("trackUpdate callback reached");
			console.log('addQueue',data);
			thisRoom._addToQueue(data);
		});

		window.messages.subscribe('room-' + thisRoom.id + '-queue-rm', function(data){
			//console.log("trackUpdate callback reached");
			console.log('rmQueue',data);
			thisRoom._removeFromQueue(data);
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
		var span = thisRoom.currentTrack.title + "<br>" + thisRoom.currentTrack.artist;
		$("#trackinfo").html(span);
	}

	this._addToQueue = function(track){
		thisRoom.currentQueue.push(track);
	}

	this._removeFromQueue = function(track){
		var newQueue = thisRoom.currentQueue.filter(function(elem){
			if(elem.id === track.id){
				return false;
			} else {
				return true;
			}

			thisRoom.queues[0] = newQueue;
			thisRoom.currentQueue = newQueue;
		});

		this.queueAdd = function(track){
			window.messages.invoke('room-' + thisRoom.id + '-queue-add',{id: thisRoom.id},function(data){
				console.log('addTrack-invoked',data);
			});
		}

		this.queueRemove = function(track){
			window.messages.invoke('room-' + thisRoom.id + '-queue-rm',{id: thisRoom.id},function(data){
				console.log('rmTrack-invoked',data);
			});
		}

	}

	thisRoom.init();
};


function Track(optsIn){
	var thisTrack = this;

	this.init = function(opts){
		opts = opts || {};
		thisTrack.artist = opts.artist || "";
		thisTrack.title = opts.title || "";

		thisTrack.videoId = opts.id || "";
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

	var quickAddDialog = document.getElementById('quick-add-dialog');
	var quickAddButton = document.getElementById('quick-add-button');
	if (! quickAddDialog.showModal) {
		window.dialogPolyfill.registerDialog(quickAddDialog);
	}

	quickAddButton.addEventListener('click', function() {
		console.log("boop!");
		quickAddDialog.showModal();
	});
	quickAddDialog.querySelector('.close').addEventListener('click', function() {
		quickAddReset();
		quickAddDialog.close();
	});

	var queueCards = document.getElementById('queue-cards');
	var showQueueButton = document.getElementById('show-queue-button');

	showQueueButton.addEventListener('click', function(){
		queueCards.style.display = queueCards.style.display === 'none' ? '' : 'none';
	});

	var quickAddInput = $('#quick-add-input');

	quickAddInput.on('change keypress', function(){
		var value = quickAddInput.val();
		if(value !== ''){
			quickAddLoading();
			YoutubeInfo(value, quickAddInfo);
		}
	});
});

function quickAddInfo(info){
	if(info.embed){
		$('#quick-add-thumbnail').attr('src', 'http://img.youtube.com/vi/' + info.id + '/default.jpg');

		if(info.title && info.title !== ''){
			$('#quick-add-title-input').val(info.title);
			$('#quick-add-title').toggleClass("is-focused");
			$('#quick-add-title').toggleClass("is-focused");
			$('#quick-add-title').addClass("is-dirty");
		}
		if(info.artist && info.artist !== ''){
			$('#quick-add-artist-input').val(info.artist);
			$('#quick-add-artist').toggleClass("is-focused");
			$('#quick-add-artist').toggleClass("is-focused");
			$('#quick-add-artist').addClass("is-dirty");
		}
		$("#quick-add-loading").hide();
		$("#quick-add-info").show();
		$("#quick-add-submit-button").removeAttr("disabled");
	} else {
		$("#quick-add-loading").hide();
		$("#quick-add-embedwarning").show();
	}

	quickAddDialog.getElementById('quick-add-submit-button').addEventListener('click', function(){
		var button = $('quick-add-submit-button');
		if(typeof(button.attr('disabled')) === 'undefined' || button.attr('disabled') === 'false'){
			var editArtist = $('#quick-add-artist-input').val();
			var editTitle = $('#quick-add-title-input').val();

			addSongToQueue({id: info.id, title: editTitle, artist: editArtist, lenth: info.length});

			quickAddDialog.close();
			quickAddReset();
		}
	});
}

function quickAddReset(){
	$('#quick-add-thumbnail').attr('src', "../images/icon.svg");
	$('#quick-add-title-input').val('');
	$('#quick-add-title').removeClass("is-focused");
	$('#quick-add-title').removeClass("is-dirty");
	$('#quick-add-artist-input').val('');
	$('#quick-add-artist').removeClass("is-focused");
	$('#quick-add-artist').removeClass("is-dirty");
	$("#quick-add-submit-button").attr("disabled","true");
	$("#quick-add-info").hide();
	$("#quick-add-embedwarning").hide();
	$("#quick-add-loading").hide();
}

function quickAddLoading(){
	$("#quick-add-info").hide();
	$("#quick-add-embedwarning").hide();
	$("#quick-add-loading").show();
}

function addSongToQueue(info){
	window.room.queueAdd(new Track(info));
}
