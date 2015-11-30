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

		thisTrack.url = opts.url || "";
		thisTrack.player = opts.player || "YT";

		thisTrack.playTime = opts.playTime || 0;
		thisTrack.currentTime = 0;
		thisTrack.timeStarted = 0;
		thisTrack.playIntervalId = -1;
	};

	this.getUpdate = function(){
		return {
			id: thisTrack.id,
			name: thisTrack.name,
			stamp: (Date.now()/1000),
			time: thisTrack.currentTime 
		}
	}

	this.getInfo = function(){
		return {
			id: thisTrack.id,
			artist: thisTrack.artist,
			name: thisTrack.name,
			url: thisTrack.url,
			player: thisTrack.player,
			playTime: thisTrack.playTime,
			currentTime: thisTrack.currentTime,
			timeStarted: thisTrack.timeStarted
		};
	}

	this.play = function(){
		thisTrack.timeStarted = Date.now();

		thisTrack.playIntervalId = setInterval( function(){
			thisTrack.currentTime++;
			if(thisTrack.currentTime > thisTrack.playTime){
				thisTrack.stop();
			}
		}, 1000);
	}

	this.stop = function(){
		clearInterval(thisTrack.playIntervalId);
		thisTrack.currentTime = 0;
		thisTrack.timeStarted = 0;
		this.stopCallback();
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

		thisRoom.currentQueue = thisRoom.queues[0] || [];
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

		thisRoom.initUpdateIntervals();

		});


	};

/*
	this.onTrackUpdate = function(update){

	};

	this.onAuth = function(update){

	};

	this.onDeauth = function(update){

	};
*/
	this.broadcastTrackUpdate = function(){
		thisRoom.socket.emit('trackUpdate', {
			data: thisRoom.currentTrack.getUpdate()
		});
	}

	this.broadcastNextTrack = function(){
		thisRoom.socket.emit('nextTrack', {
			data: thisRoom.nextTrack.getInfo()
		});
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
			thisRoom.
		});

		thisRoom.currentTrack.play();
	}

	this.stop = function(){
		clearInterval(this.intervalIds.trackUpdate);
		clearInterval(this.intervalIds.nextTrack);
		thisRoom.currentTrack.stop();
	}

	thisRoom.init(optsIn);

	thisRoom.playNext();
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
/*
	this.onTrackUpdate = function(update){
		if (thisRoomStore.rooms.hasOwnProperty(update.room.id)) {
			thisRoomStore.rooms[update.room.id].onTrackUpdate(update);
		};
	};

	this.onAuth = function(auth){
		if (thisRoomStore.rooms.hasOwnProperty(auth.room.id)) {
			thisRoomStore.rooms[update.room.id].onAuth(auth);
		};
	};

	this.onDeauth = function(auth){
		if (thisRoomStore.rooms.hasOwnProperty(auth.room.id)) {
			thisRoomStore.rooms[update.room.id].onDeauth(auth);
		};
	};
*/
	thisRoomStore.init(optsIn);
}

var testTrack = new Track({
	id: 1,
	artist: "Rick Astley",
	name: "Never Gonna Give You Up",
	url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
	player: "YT",
	playTime: 212
});

var testTrack2 = new Track({
	id: 69,
	artist: "Rick Astley",
	name: "Never Gonna Give You Up",
	url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
	player: "YT",
	playTime: 212
});

var testQueue = new Queue({
	name: "Test Queue",
	tracks: [testTrack, testTrack2, testTrack]
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
