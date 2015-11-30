//server.js
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');


function Track(optsIn){
	var thisTrack = this;

	this.init = function(opts){
		opts = opts || {};
		thisTrack.id = opts.id || 0;
		thisTrack.artist = opts.artist || "";
		thisTrack.name = opts.name || "";

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
			name: thisTrack.name,
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
			name: thisTrack.name,
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
				if(thisTrack.currentTime > thisTrack.playTime){
					thisTrack.stop();
				}
			}, 1000);
		}

		thisTrack.isPlaying = true;
	}

	this.stop = function(){
		thisTrack.stopCallback();
		thisTrack.isPlaying = false;
		thisTrack.resetTrack();
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

		thisRoom.queues = opts.queues || [];
		thisRoom.dj = opts.dj || "";
		thisRoom.users = opts.users || [];

		thisRoom.currentQueue = 0;
		thisRoom.currentQueuePos = 0;

		thisRoom.currentTrack = thisRoom.queues[0].tracks[0] || ""; //TODO: this will break with empty queue
		thisRoom.nextTrack = thisRoom.queues[0].tracks[1] || "";

		thisRoom.intervalIds = {};

		thisRoom.socket = opts.socket || io.of('/room/'+thisRoom.id);


		//socket callbacks - eventually move these
		thisRoom.socket.on('connection', function(socket){
			console.log("client connected to room " + thisRoom.name);
			console.log(thisRoom.currentTrack.getInfo());

			socket.emit('firstLoad',{
				data: thisRoom.currentTrack.getInfo()
			});

		

		});

		thisRoom.initUpdateIntervals();
		thisRoom.playNext();
	};

	this.broadcastTrackUpdate = function(){
		thisRoom.socket.emit('trackUpdate', {
			data: thisRoom.currentTrack.getUpdate()
		});
	}

	this.broadcastNextTrack = function(){
		if(thisRoom.nextTrack){
			thisRoom.socket.emit('nextTrack', {
				data: thisRoom.nextTrack.getInfo()
			});
		}
	}

	this.initUpdateIntervals = function(){
		this.intervalIds.trackUpdate = setInterval(function(){
			thisRoom.broadcastTrackUpdate();
		}, 2000);
		this.intervalIds.nextTrack = setInterval(function(){
			thisRoom.broadcastNextTrack();
		}, 5000);
	}

	this.playNext = function(){
		thisRoom.currentTrack.setStopCallback(function(){
			if(thisRoom.nextTrack && thisRoom.queues.length > thisRoom.currentQueue ){
				thisRoom.currentTrack = thisRoom.nextTrack;

				if (thisRoom.currentQueuePos >= thisRoom.queues[thisRoom.currentQueue].tracks.length ) {
					thisRoom.currentQueue++;
					thisRoom.currentQueuePos = 0;
				}
				else {
					thisRoom.currentQueuePos++;
				}

				if(thisRoom.queues[thisRoom.currentQueue]){
					thisRoom.nextTrack = thisRoom.queues[thisRoom.currentQueue].tracks[thisRoom.currentQueuePos+1];
					
				}

				thisRoom.playNext();
			}
			else{
				thisRoom.currentQueue = 0;
				thisRoom.currentQueuePos = 0;

				thisRoom.currentTrack = thisRoom.queues[0].tracks[0]; //TODO: this will break with empty queue
				thisRoom.nextTrack = thisRoom.queues[0].tracks[1];
			}
		});

		thisRoom.socket.emit('trackStart',{
			data: thisRoom.currentTrack.getInfo()
		});

		thisRoom.currentTrack.play();
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




//test stuff - move or remove later (probably mock in DB)
var testTrack = new Track({
	id: 1,
	artist: "Rick Astley",
	name: "Never Gonna Give You Up",
	videoId: "dQw4w9WgXcQ",
	player: "YT",
	playTime: 212
});

var testTrack2 = new Track({
	id: 2,
	artist: "He-Man",
	name: "Hey (what's going on)",
	videoId: "ZZ5LpwO-An4",
	player: "YT",
	playTime: 126
});

var testTrack3 = new Track({
	id: 3,
	artist: "Drake vs. Epic Sax Guy",
	name: "Hotline Sax",
	videoId: "z1rvXAlz5ao",
	player: "YT",
	playTime: 231
});

var testQueue = new Queue({
	name: "Test Queue",
	tracks: [
		//testTrack, 
		testTrack2, 
		testTrack3
	]
});

var testRoom = new Room({
	name: "hello",
	id: 0,
	queues: [testQueue],
	dj: "bob",
	users: [],

});

var roomStore = new RoomStore({
	rooms: [testRoom]
});



http.listen(1337, function(){
  console.log('listening on localhost:1337');
});
