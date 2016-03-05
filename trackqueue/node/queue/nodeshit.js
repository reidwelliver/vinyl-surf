var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'playlists'
});


var sock = io.of('/track');

sock.on('connection', function(socket){
  console.log("client connected");

  socket.on('message', function(recieveddata){

    addtracktodatabase(recieveddata);
  });
});

function addtracktodatabase(stufftopass){

  var title = stufftopass["Title"];
  var youtubeid = stufftopass["URL"];
  var length = stufftopass["Length"];

  console.log(title);
  console.log(youtubeid);
  console.log(length);

  connection.query( "INSERT INTO playlist1 (URL,NAME,length)  VALUES ("+ youtubeid +","+ title +","+ length +")", function (error, results, fields) {
    // error will be an Error if one occurred during the query
    // results will contain the results of the query
    // fields will contain information about the returned results fields (if any)
    if (error) {
      console.error('error connecting: ' + error.stack);
      return;
    }
    console.log('connected as id ' + connection.threadId);
  });
}


http.listen(1337, function(){
  console.log('listening on localhost:1337');
});
