var SSR = {};


console.log("youtubeinfo should be defined...");
function YoutubeInfo(url,callback) {
    var apikey = "AIzaSyAztbAWiJbAnn6JQ5hJ5oLEDYf7eW2mY0k";

  //I don't know why I keep doing this
  var working_url = url ;

  //this is for that library
  var uri = new URI(working_url);
  var hostname = uri.domain();
  var ending;
  var video_id;

  if(hostname =="youtube.com") {
       ending = uri.search(true);

      //this splits the youtube url and gives everything after the v.
      //produces this ZEvQOPUHGH8 from www.youtube.com/watch?v=ZEvQOPUHGH8
      video_id = ending["v"];

  } else if(hostname =="youtu.be") {
      //and the other one doesn't contain the v part
       ending = uri.segment(0);
       video_id = ending;
  }

  var requestUrl = 'https://www.googleapis.com/youtube/v3/videos?id=' + video_id + '&key=' + apikey + '&part=snippet,contentDetails,status';


  $.getJSON(requestUrl).done(function(data,status,xhr) {
    //gets the title, embedableness and length in an iso format
    var ytitle = data.items[0].snippet.title;
    var embedable = data.items[0].status.embeddable;
    var longness = convertPT(data.items[0].contentDetails.duration);
    var artist = '';


    var titleDash = ytitle.indexOf(' - ');
    if(titleDash > -1){
      var splitTitle = ytitle.split(' - ');
      artist = splitTitle[0];
      ytitle = splitTitle[1];
    }


    var toReturn = {videoId: video_id, title: ytitle, artist: artist, playTime: longness, embed: embedable };
    console.log(toReturn);

    if(callback){
      callback(toReturn);
    }
  })
}


function convertPT(timeString){
  //dear google, iso formats are cool and all but I need
  //seconds, thisremoves the PT from the string
  var minusPT = timeString.substr(2);


  //Other fun fact, it doesn't just return 0 for missing
  //fields so you gotta check 'em all
  var hour = minusPT.search("H");
  var minute=minusPT.search("M");
  var second=minusPT.search("S");
  var has_time= 0;
  var total_seconds = 0;

  //checks to see if that part of the string excists
  if(hour != "-1") {
      var hour_split = minusPT.split("H");
      has_time= 1;
  }

  if(minute != "-1") {
      var minute_split = minusPT.split("M");
      has_time = has_time + 2;
  }

  if(second != "-1") {
      var second_split = minusPT.split("S");
      has_time = has_time + 4;
  }


  //converts to seconds for any combination!
  switch(has_time) {
      case 7:
          var hour_to_seconds = parseInt(hour_split[0])*60*60;
          var minute_to_seconds = parseInt(minute_split[0].substr(2))*60;
          var seconds = parseInt(second_split[0].substr(5));
          total_seconds = hour_to_seconds+minute_to_seconds+seconds;
          break;

      case 6:
          var minute_to_seconds = parseInt(minute_split[0])*60;
          var seconds = parseInt(second_split[0].substr(2));
          total_seconds = minute_to_seconds+seconds;
          break;

      case 5:
          var hour_to_seconds = parseInt(hour_split[0])*60*60;
          var seconds = parseInt(second_split[0].substr(2));
          total_seconds = hour_to_seconds+seconds;
          break;

      case 4:
          var seconds = parseInt(second_split[0]);
          total_seconds = seconds;
          break;

      case 3:
          var hour_to_seconds = parseInt(hour_split[0])*60*60;
          var minute_to_seconds = parseInt(minute_split[0].substr(2))*60;
          total_seconds = hour_to_seconds+seconds;
          break;

      case 2:
          var minute_to_seconds = parseInt(minute_split[0])*60;
          total_seconds = minute_to_seconds;
          break;

      case 1:
          var hour_to_seconds = parseInt(hour_split[0])*60*60;
          total_seconds = hour_to_seconds;
          break;
  }
  return total_seconds;
}



/*
//Could merge, like having the button
function OutputResults(object_to_output) {
  SSR.Title = document.getElementById("Theonlyform").elements[1].value;
  SSR.Playlist = document.getElementById("PlaylistSelecter").value;
  SSR.USERSNAME = document.getElementById("Theonlyform").elements[3].value;
  //gets name of playlist for output

  //done here
  console.log(SSR);
  //this is where it sends messages to node
  socket.emit('addtracktodatabase',
  SSR
  );

  //for results
  document.getElementById('box1').innerHTML="<textarea rows='40' cols='100'>"+JSON.stringify(SSR) +"</textarea>";
}

//shows tracks on playlists
function ShowPlaylist(){

  var Playlistname =  document.getElementById("PlaylistSelecter").value;
  var USERtoREMOVE =  document.getElementById("Theonlyform").elements[3].value;
  var Objectforpassing = {playlist:Playlistname,user:USERtoREMOVE};

  console.log (Objectforpassing);
  socket.emit('playlistlist',
      Objectforpassing
    );


}

//removes track from playlist
function RemoveTrack(IDtoremove){
  console.log("removed");
  socket.emit('RemoveTrack',
      IDtoremove
    );
}


//shows all the playlists belonging to user
function RetrievePlaylists(){
  console.log("RetrievePlaylists");

  //grabs from the  USER: field
    var USERtoREMOVE =  document.getElementById("Theonlyform").elements[3].value;
    console.log(USERtoREMOVE);
    socket.emit('RetrievePlaylists',
        USERtoREMOVE
      );


}

function AddPlaylist(){

  console.log("RetrievePlaylists");

  //grabs from Playlist: field and User: field
    var PLAYLISTtoCREATE =  document.getElementById("Theonlyform").elements[2].value;
    var USERwhoCREATED = document.getElementById("Theonlyform").elements[3].value;
    var objectforDATA = {name: PLAYLISTtoCREATE, user:USERwhoCREATED};

    console.log(PLAYLISTtoCREATE);
    socket.emit('CreatePlaylist',
          objectforDATA
      );


}
*/
