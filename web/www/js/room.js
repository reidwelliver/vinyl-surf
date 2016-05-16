if(!window.isPaused){
	window.isPaused = false;
} else {
	$('#play-button-icon').html("play_circle_filled");
}

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
		if(!window.player){
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
		}
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

		opts.players = opts.players || {};

		thisRoom.playerReady = false;

		thisRoom.players = {
			YT: new YoutubePlayer(opts.players.YT)
		}

		thisRoom.messageInit();
	};

	this.messageInit = function(){
		window.messages.subscribe('room-' + thisRoom.id + '-update', function(data){
			//console.log('update',data);
			thisRoom.receiveTrackUpdate(data);
		});

		window.messages.subscribe('room-' + thisRoom.id + '-queue-add', function(data){
			console.log('addQueue!!!!!',data);
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

		console.log('invoking room-' + thisRoom.id + '-load');
		window.messages.invoke('room-' + thisRoom.id + '-load',{},function(data){
			console.log('load fn worked',data);
			thisRoom.receiveFirstLoad(data);
		});
	}


	this.skipTrack = function(){
		console.log("skipping track!");
		window.messages.invoke('room-' + thisRoom.id + '-skip',{},function(){});
	}

	this.receiveFirstLoad = function(roomdata){
		console.log("First Load!!");
		console.log(roomdata);
		thisRoom.currentQueuePos = roomdata.hasOwnProperty('currentQueuePos') ? roomdata.currentQueuePos : thisRoom.currentQueuePos;


		roomdata.queue.tracks.forEach(function(track){
			var conTrack = new Track(track);
			thisRoom.queue.tracks.push(conTrack);

			console.log('adding track to queuecards');
			$('#queue-cards').append(conTrack.queueCard());
			console.log(conTrack.queueCard());
		});

		thisRoom.whenPlayerReady(function(track){
			if(thisRoom.players.hasOwnProperty(track.player)){
				thisRoom.currentTrack = new Track(track);
				if(!window.isPaused){
					thisRoom.players[track.player].playNow(track);
				}
				thisRoom.updateTrackBar(track);
			}
		}, thisRoom.queue.tracks[thisRoom.currentQueuePos]);
	};

	this.togglePlay = function(){
		window.isPaused = !window.isPaused;
		if(window.isPaused){
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
				if(!window.isPaused){
					thisRoom.players[track.player].playNow(track);
				}
				thisRoom.updateTrackBar(track);
			}

			var difference = (track.currentTime - window.player.getCurrentTime()) - ((Date.now()/1000) - track.stamp);

			if( !window.isPaused && ( difference > 3 || difference < -3 )){
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
		var title = $('#bar-video-title');
		var artist = $('#bar-video-artist');

		title.html(track.title);
		artist.html(track.artist);
	}

	this._addToQueue = function(track){
		track = new Track(track);
		thisRoom.queue.tracks.push(track);

		var queueButton = $("show-queue-button");
		var numNew = 1;

		if(queueButton.prop('data-badge')){
			numNew += queueButton.prop('data-badge');
		}
		queueButton.prop('data-badge',numNew);

		$('#queue-cards').append(track.queueCard());
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

	this.queueCard = function(){
		var card = '<div class="queue-card-image mdl-card mdl-shadow--2dp" ' +
			'style="background: url(\'http://img.youtube.com/vi/' + thisTrack.videoId + '/default.jpg\') center / cover;">' +
			'<div class="mdl-card__title mdl-card--expand"></div><div class="mdl-card__actions">' +
			'<span class="queue-card-text">' + thisTrack.title + '</span>' +
			'</div></div>';
			return card;
	}

	thisTrack.init(optsIn);
};


function quickAddInfo(info){
	if(info.embed){
		$('#quick-add-thumbnail').attr('src', 'http://img.youtube.com/vi/' + info.videoId + '/default.jpg');

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
	console.log("resetting quick-add");
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







//todo: move this
var prevVal = '';

$(document).ready(function(){
	window.room = new Room({id:55});

	var quickAddDialog = document.getElementById('quick-add-dialog');
	var quickAddButton = document.getElementById('quick-add-button');

	window.dialogPolyfill.registerDialog(quickAddDialog);
/*
	if (! quickAddDialog.showModal) {
		window.dialogPolyfill.registerDialog(quickAddDialog);
	}
*/

	quickAddButton.addEventListener('click', function() {
		quickAddDialog.showModal();
	});


	$("#thumbsdown-button").click(function() {
		window.room.skipTrack();
	}

	$("#chat-show-button").click(function() {

		var container = $("#chat");
  	  if (!container.is(":visible")) {
			$("#chat").height($(window).height() - $(".mdl-layout__header-row").height() - $("#footer").height() - 15);
			$("#chat-box").height($("#chat").height() + ($("#chat-field").height() * 2));
			//$("#chat-box").css("overflow", "scroll");

			//$("#tubular-container").width($(window).width() - container.width());
			//$("#tubular-shield").width($(window).width() - container.width());
			//window.resizeTubular(window.height, $(window).width() - container.width());
			//$tubularPlayer = $('#tubular-player');
			//$tubularPlayer.width($(window).width() - container.width());
			container.show();
    }
		else {
			//$tubularPlayer.width($(window).width());
			container.hide();
		}
	//	this.focus();
	});

	quickAddDialog.querySelector('.close').addEventListener('click', function() {
		quickAddDialog.close();
	});

	document.getElementById('quick-add-submit-button').addEventListener('click', function(){
		console.log("what is this dialog doing!?!?");
		var button = $('quick-add-submit-button');
		if(typeof(button.prop('disabled')) === 'undefined' || button.prop('disabled') === 'false'){
			var editArtist = $('#quick-add-artist-input').val();
			var editTitle = $('#quick-add-title-input').val();
			var videoId = $('#quick-add-videoid').val();
			var len = $('#quick-add-playtime').val();


			console.log("resetting and closing add dialog");
			//quickAddReset();
			quickAddDialog.close();

			console.log("adding song to queue");

			window.room.queueAdd({videoId: videoId, title: editTitle, artist: editArtist, playTime: len});

		}
	});


	var queueCards = document.getElementById('queue-cards');
	var showQueueButton = document.getElementById('show-queue-button');

	showQueueButton.addEventListener('click', function(){
		queueCards.style.display = queueCards.style.display === 'none' ? '' : 'none';
	});

	var quickAddInput = $('#quick-add-input');

	quickAddInput.on('change keypress keyup focus', function(){
		var value = quickAddInput.val();
		if(value !== '' && value != prevVal){
			prevVal = value;
			quickAddLoading();
			YoutubeInfo(value, quickAddInfo);
		}
	});

	var queueButton = $("show-queue-button");
	queueButton.on('click', function(){
		queueButton.removeProp('data-badge');
	})

});
