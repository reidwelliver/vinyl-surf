var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


//mysql shit
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'playlists'
});

//I'll be honest not sure what this does
var sock = io.of('/track');

//when a client connects
sock.on('connection', function(socket){
  console.log("client connected");

//for adding tracks, note the first part is the type of message, the data is passed into the function
  socket.on('addtracktodatabase', function(recieveddata){
//recieved data for this one should be a json
    addtracktodatabase(recieveddata);
  });
  socket.on('playlistlist', function(recieveddata){
//recieved data for this one should be the playlist name, not yet implimented
    playlistlist(recieveddata);
  });

  socket.on('RemoveTrack', function(recieveddata){
      //recieved data should be track ID
    removetrackfromdatabase(recieveddata);
  });

  socket.on('RetrievePlaylists', function(recieveddata){
      //recieved data should be track ID
    retrieveplaylists(recieveddata);
  });

  socket.on('CreatePlaylist', function(recieveddata){
      //recieved data should be track ID
    CreatePlaylist(recieveddata);
  });


});

//retrieves tracks in a playlist
function playlistlist(stufftopass){

  var playlistname = stufftopass["playlist"];
  var username = stufftopass["user"];

  var sqlquery = "SELECT track_ids FROM listofplaylists WHERE name ='"+ playlistname +"' and user = '"+ username +"'; ";
  console.log(sqlquery);
  connection.query( sqlquery, function (error, results, fields) {
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)

    if (error) {
      //this will dump a bunch of shit that you can't understand, look near the top for the actual issue
      console.error('error connecting: ' + error.stack);
      console.log( sqlquery);

      return;
    }
    if (results){
      console.log(results);

      splitandlist(results);
    }
    console.log('connected as id ' + connection.threadId);
  });

}

//this is going to split what's returned when a playlist gotten from the databae, and then runs throught the array
function splitandlist(stufftopass){

  //  var arrayforqueryresults = [];
    console.log(stufftopass[0]["track_ids"]);
  //  var arraysplit = stufftopass[0]["track_ids"].split(",");
  //  console.log(arraysplit);
  //  var previousqueryarraycount= arraysplit.length;
  //  console.log(previousqueryarraycount);


  //  for (i = 0; i < previousqueryarraycount; i++) {

    //  var queryidnumber = arraysplit[i];

    //  console.log(queryidnumber);

      var sqlquery = "SELECT * FROM playlist1 WHERE ID IN ("+ stufftopass[0]['track_ids'] +"); ";
      connection.query( sqlquery, function (error, results, fields) {
        if (error) {
          //this will dump a bunch of shit that you can't understand, look near the top for the actual issue
          console.error('error connecting: ' + error.stack);
          console.log( sqlquery);

          return;
        }
        if (results){
          console.log(results);
          console.log("succeed");
        //  arrayforqueryresults.push(results);
        sock.emit('askedforplaylistresults',
            results
          );



        }


      })
  //  };
    console.log("finishedfinally");
  //  console.log (arrayforqueryresults);


  //

}


function addtracktodatabase(stufftopass){

  var title = stufftopass["Title"];
  var youtubeid = stufftopass["URL"];
  var length = stufftopass["Length"];
  var playlisttopass = stufftopass["Playlist"];
  var userwhosadding = stufftopass["USERSNAME"];

  console.log(title);
  console.log(youtubeid);
  console.log(length);
  console.log(playlisttopass);
  console.log(userwhosadding);
  //remeber how much fun you had figuring out that you needed to put that second set of '' around the "", pepperidge farm remebers
  var sqlquery = "INSERT INTO playlist1 (URL,NAME,length)  VALUES ('"+ youtubeid +"','"+ title +"','"+ length +"')";
  connection.query( sqlquery, function (error, results, fields) {
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)

    if (error) {
      //this will dump a bunch of shit that you can't understand, look near the top for the actual issue
      console.error('error connecting: ' + error.stack);
      console.log( sqlquery);

      return;
    }
    if (results){
      console.log(results.insertId)

      var objectforpassing = { IDresult: results.insertId, user: userwhosadding, playlist: playlisttopass  }
      modifyplaylist(objectforpassing);
    }
    console.log('connected as id ' + connection.threadId);
  });
}


function removetrackfromdatabase(stufftopass){


  var sqlquery = "DELETE FROM playlist1 WHERE ID="+ stufftopass  +" ";
  connection.query( sqlquery, function (error, results, fields) {
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)

    if (error) {
      //this will dump a bunch of shit that you can't understand, look near the top for the actual issue
      console.error('error connecting: ' + error.stack);
      console.log( sqlquery);

      return;
    }
    console.log('connected as id ' + connection.threadId);
  });

}
//for getting all the playlists a user has
function retrieveplaylists(USERNAME){

  var sqlquery = "SELECT * FROM listofplaylists WHERE user='"+ USERNAME +"';";


  connection.query( sqlquery, function (error, results, fields) {
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)

    if (error) {
      //this will dump a bunch of shit that you can't understand, look near the top for the actual issue
      console.error('error connecting: ' + error.stack);
      console.log( sqlquery);

      return;
    }

    if (results){
      console.log(results);
      sock.emit('USERSPLAYLISTS',
          results
        );

    }
    console.log('connected as id ' + connection.threadId);
  });

}

function CreatePlaylist(DataforCreation){

  //splitting out the object
  var playlistname = DataforCreation["name"];
  console.log (playlistname);
  var usernameforplaylistcreation = DataforCreation["user"]
  console.log (usernameforplaylistcreation);

  var sqlquery = "INSERT INTO listofplaylists (user,name )  VALUES ('"+ usernameforplaylistcreation +"','"+ playlistname +"');";


  connection.query( sqlquery, function (error, results, fields) {
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)

    if (error) {
      //this will dump a bunch of shit that you can't understand, look near the top for the actual issue
      console.error('error connecting: ' + error.stack);
      console.log( sqlquery);

      return;
    }

    if (results){
      retrieveplaylists(usernameforplaylistcreation);

    }
    console.log('connected as id ' + connection.threadId);
  });

}

//this is to add newly added tracks to a playlist
function modifyplaylist(objecttoadd){
  console.log(objecttoadd.playlist);

  var sqlquery = "SELECT track_ids FROM listofplaylists WHERE user='"+ objecttoadd.user +"' and name='"+objecttoadd.playlist+"';";
  connection.query( sqlquery, [objecttoadd], function (error, results, fields) {
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)

    if (error) {
      //this will dump a bunch of shit that you can't understand, look near the top for the actual issue
      console.error('error connecting: ' + error.stack);
      console.log( sqlquery);

      return;
    }
    if (results){

     var modfiedplaylist = results;
      modfiedplaylist += ",'";
      modfiedplaylist += objectoadd.IDresult;
      modfiedplaylist += "'"

      var sqlquery = "INSERT INTO listofplaylists (track_ids )  VALUES ('"+ modifedplaylist +"');";
      connection.query( sqlquery,function (error, results, fields) {
        // error will be an Error if one occurred during the query
        // results will contain the results of the query
        // fields will contain information about the returned results fields (if any)

        if (error) {
          //this will dump a bunch of shit that you can't understand, look near the top for the actual issue
          console.error('error connecting: ' + error.stack);
          console.log( sqlquery);

          return;
        }
        if (results){
          console.log("success")


        }
        console.log('connected as id ' + connection.threadId);
      });



    }
    console.log('connected as id ' + connection.threadId);
  });




}
//this makes sure your client can hear you
http.listen(1337, function(){
  console.log('listening on localhost:1337');
});
