function YoutubePlayer(optsIn){
      var thisPlayer = this;

      this.init = function(opts){
            //thisPlayer.initFrame(opts);
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

                  console.log("loaded!");
            };
      };

      this.init(optsIn);

      //TODO: Media Control, queueing, 
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
                  thisRoom.receiveFirstLoad(data);
            });

            thisRoom.socket.on('trackUpdate', function(data){
                  thisRoom.receiveTrackUpdate(data);
            });

            thisRoom.socket.on('nextTrack', function(data){
                  thisRoom.receiveNextTrack(data);
            });
      };

      this.receiveFirstLoad = function(data){
            console.log("first load received");
      };

      this.receiveTrackUpdate = function(data){
            console.log("track update received");
      };

      this.receiveNextTrack = function(data){
            console.log("next track received");
      };

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