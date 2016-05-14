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
function Queue(optsIn){
	var thisQueue = this;

	this.init = function(opts){
		opts = opts || {};
		thisQueue.tracks = opts.tracks || [];
		thisQueue.name = opts.name || "";
	};

	thisQueue.init(optsIn);
}


function YoutubePlayer(optsIn){
	var thisPlayer = this;

	this.init = function(opts){
		thisPlayer.initFrame(opts);
	};

	this.initFrame = function(opts){
		var tubOpts = {
        ratio: 16/9, // usually either 4/3 or 16/9 -- tweak as needed
        videoId: 'Q-WM-x__BOk',
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

		thisRoom.currentTrack = "";
		thisRoom.currentPlayer = "";

		thisRoom.queue = new Queue();

		thisRoom.nextTrack = "";
		thisRoom.nextPlayer = "";

		thisRoom.currentQueuePos = 0;

		thisRoom.isPaused = false;

		opts.players = opts.players || {};

		thisRoom.playerReady = false;

		thisRoom.players = {
			YT: new YoutubePlayer(opts.players.YT)
		}
		if(!window.messages.state.connected){
			window.messages.connect(function(){
				console.log("connected!");
				thisRoom.messageInit();
			});
		} else {
			thisRoom.messageInit();
		}
	};

	this.messageInit = function(){
		window.messages.subscribe('room-' + thisRoom.id + '-update', function(data){
			//console.log('update',data);
			thisRoom.receiveTrackUpdate(data);
		});

		window.messages.subscribe('room-' + thisRoom.id + '-queue-add', function(data){
			console.log('addQueue',data);
			thisRoom._addToQueue(data);
		});

		window.messages.subscribe('room-' + thisRoom.id + '-queue-rm', function(data){
			console.log('rmQueue',data);
			thisRoom._removeFromQueue(data);
		});

		window.messages.subscribe('room-' + thisRoom.id + '-next', function(data){
			//console.log('next',data);
			thisRoom.receiveNextTrack(data);
		});

		window.messages.subscribe('room-' + thisRoom.id + '-start', function(data){
			//console.log('start',data);
			thisRoom.receiveTrackUpdate(data);
		});

		window.messages.invoke('room-' + thisRoom.id + '-load',{},function(data){
			console.log('load',data);
			thisRoom.receiveFirstLoad(data);
		});
	}


	this.receiveFirstLoad = function(roomdata){
		console.log("First Load!!")
		console.log(roomdata);
		thisRoom.queue.tracks = roomdata.queue.tracks;
		thisRoom.currentQueuePos = roomdata.hasOwnProperty('currentQueuePos') ? roomdata.currentQueuePos : thisRoom.currentQueuePos;

		var track = thisRoom.queue.tracks[thisRoom.currentQueuePos];
		thisRoom.whenPlayerReady(function(track){
			if(thisRoom.players.hasOwnProperty(track.player)){
				thisRoom.currentTrack = new Track(track);
				thisRoom.players[track.player].playNow(track);
				thisRoom.updateTrackBar(track);
			}
		}, track);
	};

	this.togglePlay = function(){
		thisRoom.isPaused = !thisRoom.isPaused;
		if(thisRoom.isPaused){
			$('#play-button-icon').html("play_circle_filled");
			window.player.pauseVideo();
		} else {
			$('#play-button-icon').html("pause_circle_filled");
			window.player.playVideo();
		}
	}


	this.receiveTrackUpdate = function(track){
		thisRoom.whenPlayerReady(function(track){
			if(window.player.getVideoUrl().indexOf(track.videoId) === -1){
				thisRoom.currentTrack = new Track(track);
				thisRoom.players[track.player].playNow(track);
				thisRoom.updateTrackBar(track);
			}

			var difference = (track.currentTime - window.player.getCurrentTime()) - ((Date.now()/1000) - track.stamp);

			if( !thisRoom.isPaused && ( difference > 3 || difference < -3 ) && thisRoom.players.hasOwnProperty(track.player)){
				thisRoom.players[track.player].seekTo(track.currentTime);
				thisRoom.updateTrackBar(track);
			}
		}, track);
	};

	this.receiveNextTrack = function(track){
		thisRoom.whenPlayerReady(function(track){
			if(thisRoom.nextTrack.videoId !== track.videoId && thisRoom.players.hasOwnProperty(track.player)){
				thisRoom.nextTrack = new Track(track);
				thisRoom.players[thisRoom.nextTrack.player].queue(thisRoom.nextTrack);
			}
		}, track);
	};

	this.whenPlayerReady = function(callback, params){
		if(!window.player){
			console.log("waiting for player to be ready");
			setTimeout(thisRoom.whenPlayerReady,200,callback,params);
		}
		else if (thisRoom.playerReady){
			callback(params);
		} else {
			window.player.addEventListener('onReady', function(){
				thisRoom.playerReady = true;
				callback(params);
			});
		}
	}

	this.updateTrackBar = function(track){
		$('#bar-video-title').html(track.title);
		$('#bar-video-artist').html(track.artist);
	}

	this._addToQueue = function(track){
		thisRoom.queue.tracks.push(track);

		var queueButton = $("show-queue-button");
		var numNew = 1;

		if(queueButton.prop('data-badge')){
			numNew += queueButton.prop('data-badge');
		}
		queueButton.prop('data-badge',numNew);
	}

	this._removeFromQueue = function(track){
		var newQueue = thisRoom.queue.tracks.filter(function(elem){
			if(elem.videoId === track.videoId){
				return false;
			} else {
				return true;
			}

			thisRoom.queues[0] = newQueue;
			thisRoom.queue = newQueue;
		});
	}

	this.queueAdd = function(track){
		window.messages.invoke('room-' + thisRoom.id + '-queue-add',track,function(data){
			console.log('addTrack-invoked',data);
		});
	}

	this.queueRemove = function(track){
		window.messages.invoke('room-' + thisRoom.id + '-queue-rm',track,function(data){
			console.log('rmTrack-invoked',data);
		});
	}

	thisRoom.init();
};


function Track(optsIn){
	var thisTrack = this;

	this.init = function(opts){
		opts = opts || {};
		thisTrack.artist = opts.artist || "";
		thisTrack.title = opts.title || "";

		thisTrack.videoId = opts.videoId || "";
		thisTrack.player = opts.player || "YT";

		thisTrack.playTime = opts.playTime || 0;
		thisTrack.timeStarted = 0;

		thisTrack.queued = false;
	};

	thisTrack.init(optsIn);
};


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

		$('#quick-add-videoid').val(info.videoId);
		$('#quick-add-playtime').val(info.playTime);

		$("#quick-add-loading").hide();
		$("#quick-add-info").show();
		$("#quick-add-submit-button").removeAttr("disabled");
	} else {
		$("#quick-add-loading").hide();
		$("#quick-add-embedwarning").show();
	}
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







$(document).ready(function(){
	window.room = new Room({id:69});

	var nicknameDialog = document.getElementById('nickname-dialog');
	var nicknameButton = document.getElementById('nickname-button');
	if (! nicknameDialog.showModal) {
		window.dialogPolyfill.registerDialog(nicknameDialog);
	}

	nicknameButton.addEventListener('click', function() {
		nicknameDialog.showModal();
	});
	nicknameDialog.querySelector('.close').addEventListener('click', function() {
		nicknameDialog.close();
	});


	var quickAddDialog = document.getElementById('quick-add-dialog');
	var quickAddButton = document.getElementById('quick-add-button');
	if (! quickAddDialog.showModal) {
		window.dialogPolyfill.registerDialog(quickAddDialog);
	}

	quickAddButton.addEventListener('click', function() {
		quickAddDialog.showModal();
	});
	quickAddDialog.querySelector('.close').addEventListener('click', function() {
		quickAddReset();
		quickAddDialog.close();
	});

	document.getElementById('quick-add-submit-button').addEventListener('click', function(){
		var button = $('quick-add-submit-button');
		if(typeof(button.attr('disabled')) === 'undefined' || button.attr('disabled') === 'false'){
			var editArtist = $('#quick-add-artist-input').val();
			var editTitle = $('#quick-add-title-input').val();

			var videoId = $('#quick-add-videoid').val();
			var len = $('#quick-add-playtime').val();


			addSongToQueue({videoId: videoId, title: editTitle, artist: editArtist, playTime: len});

			quickAddDialog.close();
			quickAddReset();
		}
	});


	var queueCards = document.getElementById('queue-cards');
	var showQueueButton = document.getElementById('show-queue-button');

	showQueueButton.addEventListener('click', function(){
		queueCards.style.display = queueCards.style.display === 'none' ? '' : 'none';
	});

	var quickAddInput = $('#quick-add-input');

	quickAddInput.on('change keypress keyup focus mouseenter', function(){
		var value = quickAddInput.val();
		if(value !== ''){
			quickAddReset();
			quickAddLoading();
			YoutubeInfo(value, quickAddInfo);
		}
	});

	var queueButton = $("show-queue-button");
	queueButton.on('click', function(){
		queueButton.removeProp('data-badge');
	})

});
