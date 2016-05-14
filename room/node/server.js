var stomp = require('./stomp-client.js');

var messages = new stomp({
	endpoint: 'ws://vinyl.surf:15674/stomp/websocket',
	user: 'vinyl-surf',
	pass: 'vinyl-surf',
	mode: 'server'
});




var trackIdGlob = 0;

function Track(optsIn){
	var thisTrack = this;

	this.init = function(opts){
		opts = opts || {};
		thisTrack.id = opts.id || ++trackIdGlob;
		thisTrack.artist = opts.artist || "";
		thisTrack.title = opts.title || "";

		thisTrack.videoId = opts.videoId || "";
		thisTrack.player = opts.player || "YT";

		thisTrack.playTime = opts.playTime || 0;
		thisTrack.currentTime = 0;
		thisTrack.timeStarted = 0;
		thisTrack.playIntervalId = -1;

		thisTrack.isPlaying = false;
	};

	this.getUpdate = function(){
		return {
			id: thisTrack.id,
			artist: thisTrack.artist,
			title: thisTrack.title,
			videoId: thisTrack.videoId,
			player: thisTrack.player,
			playTime: thisTrack.playTime,
			currentTime: thisTrack.currentTime,
			timeStarted: thisTrack.timeStarted,
			stamp: (Date.now()/1000)
		}
	}

	this.getInfo = function(){
		return {
			id: thisTrack.id,
			artist: thisTrack.artist,
			title: thisTrack.title,
			videoId: thisTrack.videoId,
			player: thisTrack.player,
			playTime: thisTrack.playTime,
			currentTime: thisTrack.currentTime,
			timeStarted: thisTrack.timeStarted,
			stamp: (Date.now()/1000)
		};
	}

	this.play = function(){
		thisTrack.timeStarted = (Date.now()/1000);

		if (!thisTrack.isPlaying){
			thisTrack.playIntervalId = setInterval( function(){
				thisTrack.currentTime++;
				//console.log("inc trackid "+thisTrack.id + " : " + thisTrack.currentTime + " : " + thisTrack.playTime);
				if(thisTrack.currentTime > thisTrack.playTime){
					thisTrack.stop();
				}
			}, 1000);
		}

		thisTrack.isPlaying = true;
	}

	this.stop = function(){
		thisTrack.isPlaying = false;
		thisTrack.resetTrack();
		thisTrack.stopCallback();
	}

	this.resetTrack = function(){
		clearInterval(thisTrack.playIntervalId);
		thisTrack.currentTime = 0;
		thisTrack.timeStarted = 0;
		thisTrack.isPlaying = false;
	}

	this.setStopCallback = function(callback){
		this.stopCallback = callback;
	}

	thisTrack.init(optsIn);
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





function Room(optsIn){
	var thisRoom = this;

	this.init = function(opts){
		opts = opts || {};
		thisRoom.name = opts.name || "";
		thisRoom.id = opts.id || 0;

		thisRoom.queue = opts.queue || new Queue(thisRoom.name);
		thisRoom.dj = opts.dj || "";
		thisRoom.users = opts.users || [];

		thisRoom.currentQueuePos = 0;


		thisRoom.intervalIds = {};

		messages.provide('room-' + thisRoom.id + '-load', function(message, options, respondMethod){
			console.log("client connected to room " + thisRoom.name);
			respondMethod(thisRoom.firstLoadData(), options);
		});


		messages.provide('room-' + thisRoom.id + '-queue-rm', function(message, options, respondMethod){
			console.log("client removed track from queue " + message);
		});

		messages.provide('room-' + thisRoom.id + '-queue-add', function(message, options, respondMethod){
			console.log("client added track to queue ")
			console.log(message);
			thisRoom.addToQueue(message);
		});

		thisRoom.initUpdateIntervals();
		thisRoom.playNext();
	};

	this.addToQueue = function(track){
		if(!(track instanceof Track)){
			track = new Track(track);
		}

		thisRoom.queue.tracks.push(track);

		messages.publish('room-' + thisRoom.id + '-queue-add', track.getUpdate());
	}

	this.removeFromQueue = function(track){
		if(!(track instanceof Track)){
			track = new Track(track);
		}

		var newQueue = thisRoom.queue.tracks.filter(function(elem){
			if(elem.videoId === track.videoId){
				return false;
			} else {
				return true;
			}

			thisRoom.queue.tracks = newQueue;
		});

		messages.publish('room-' + thisRoom.id + '-queue-rm', track.getUpdate());
	}

	this.firstLoadData = function(){
		var info = {
			queue: thisRoom.queue,
			currentQueuePos: thisRoom.currentQueuePos
		}

		return info;
		//return thisRoom.queue.tracks[thisRoom.currentQueuePos].getInfo();
	}

	this.broadcastTrackUpdate = function(){
		messages.publish('room-' + thisRoom.id + '-update', thisRoom.queue.tracks[thisRoom.currentQueuePos].getUpdate());
	}

	this.broadcastNextTrack = function(){
		messages.publish('room-' + thisRoom.id + '-next', thisRoom.nextTrack().getInfo());
	}

	this.initUpdateIntervals = function(){
		this.intervalIds.trackUpdate = setInterval(function(){
			thisRoom.broadcastTrackUpdate();
		}, 2000);
		this.intervalIds.nextTrack = setInterval(function(){
			thisRoom.broadcastNextTrack();
		}, 5000);
	}

	this.currentTrack = function(){
		return thisRoom.queue.tracks[thisRoom.currentQueuePos];
	}

	this.nextTrackPos = function(){
		if(thisRoom.queue.tracks.length > thisRoom.currentQueuePos+1){
			return thisRoom.currentQueuePos+1;
		} else {
			return 0;
		}
	}

	this.nextTrack = function(){
		return thisRoom.queue.tracks[thisRoom.nextTrackPos()];
	}

	this.playNext = function(){
		thisRoom.currentTrack().setStopCallback(function(){
				thisRoom.currentQueuePos = thisRoom.nextTrackPos();
				thisRoom.playNext();
			});

		messages.publish('room-' + thisRoom.id + '-start', thisRoom.currentTrack().getInfo());

		thisRoom.currentTrack().play();
	}

	this.stop = function(){
		clearInterval(thisRoom.intervalIds.trackUpdate);
		clearInterval(thisRoom.intervalIds.nextTrack);
	}

	thisRoom.init(optsIn);
}



function User(optsIn){
	var thisUser = this;

	this.init = function(opts){
		opts = opts || {};
		thisUser.name = opts.name || "";
		thisUser.id = opts.id || -1;
	}

	thisUser.init(optsIn);
}




function RoomStore(optsIn){
	var thisRoomStore = this;

	this.init = function(opts){
		opts = opts || {};
		thisRoomStore.rooms = opts.rooms || {};
	};

	this.addRoom = function(roomIn){
		thisRoomStore.rooms[roomIn.id] = roomIn;
	};

	thisRoomStore.init(optsIn);
}





messages.connect(function(){
	console.log("connected!");

	var testQueue = new Queue({
		name: "Test Queue",
		tracks: [
			new Track({
				id: 1,
				artist: "Shugo Tokumaru",
				title: "Katachi",
				videoId: "Q-WM-x__BOk",
				player: "YT",
				playTime: 184
			})
		]
	});

	var testRoom = new Room({
		name: "hello",
		id: 69,
		queue: testQueue,
		dj: "bob",
		users: [],

	});

	this.roomStore = new RoomStore({
		rooms: [testRoom]
	});
});
