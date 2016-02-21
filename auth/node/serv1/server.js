var sql = require('sql');
var mysql = require('mysql');
var crypto = require('crypto');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');


function Auth(callback) {
    var thisAuth = this;
    var connect = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '',
      database : 'surf'
    });   
    
    this.SocketEvents = function () {
        thisSocketEvents = this;
        console.log("Creating socket events");
        
        thisAuth.socket.on('connection', function(socket){
            console.log("Someone connected"); 
            socket.on('Login', function(data){
                var username = data.username;
                var password = data.password;
                
                if (username == undefined || password == undefined ||  username.length < 4 || password.length < 4)
                    return;
                thisAuth.Login(username, password, function(err, token) {
                    if (err)
                        console.log(err);
                    else {
                        console.log("Successful Login. Token =", token);
                        socket.emit("Token", {token: token});
                    }
                }); 
            });
        
            socket.on('Message', function(data){
                console.log("test", data);
            });     
        });
                 
    }
    this.init = function() {
        thisAuth.socket = io.of('/auth');
        thisAuth.SocketEvents();
    }
    this.User = function(username, password, email) {
        this.username = username;
        this.password = password;
        this.email = email;
    }
    this.TokenUser  = function (user_id, token) {
        this.user_id = user_id;
        this.token = token;
        this.expire_time = (Date.now() / 1000) + 900;
    }
        
    this.SetToken = function(TokenUser, callback) {
        connect.query('INSERT INTO tokens SET ?', TokenUser, function (err, result) {
            callback(err);
        });    
    }
    
    this.Login = function(username, password, callback) {
        var thisLogin = this;
        this.DoLogin(username, password, function(err, user_row) {
            if (err) {
                console.log(err);
                console.log(new Error().stack);
                callback("");
            }
            else if (user_row) {
                var token = crypto.randomBytes(64).toString('hex');
                thisLogin.SetToken(new thisLogin.TokenUser(user_row['id'], token), function (err) {
                    if (err)
                        callback(err, null);
                    else
                        callback(err, token); 
                });
            }   
            else {
                callback("");
                console.log("Login failed");
            }
        });
    }
    this.DoLogin = function(username, password, callback) {
        connect.query("SELECT * FROM users WHERE username = ? and password = ?", [username, password],  function (err, rows, fields) {
            if (err) {
                callback(err, null);
            }
            else if (rows.length > 0) {
                callback(err, rows[0]);
            }        
            else {
                callback(err, null);
            }
        });         
    }
    this.checkUsername = function(username, callback) {
        connect.query("SELECT * FROM users WHERE username = ?", username, function (err, rows, fields) {
            if (err) {
                callback(err, false);
            }
            else if (rows.length > 0) {
               callback(err, false);
            }        
            else {
                callback(err, true);
            }
        });          
    }
    this.SQLRegister = function(user, callback) {
        var qUser = {username: user.username, password: user.password, email_address: user.email};
        connect.query("INSERT INTO users SET ?", qUser, function (err, results) {
            if (err) {
                callback(err, false);
            }
            callback(err, true);
        });         
    }
    this.Register = function(username, password, email) {
        var thisRegister = this;
        this.checkUsername(username, function(err, success) {
            if (err) {
                console.log(new Error().stack);
            }
            if (success) {
                thisRegister.SQLRegister(new thisRegister.User(username, password, email), function(err, success) {
                    if (err) {
                        console.log(err);
                    }
                    else if (success) {
                        console.log("registered");
                    }
                });
            }
            else
                console.log("user already registered");
        });        
    }
    thisAuth.init();
}


var auth = new Auth(null);
//auth.Register("test1", "test", "test@test.com");
http.listen(1337, function(){
  console.log('listening on localhost:1337');
});

/*auth.Login("test1", "test", function(err, token) {
    if (err)
        console.log(err);
    else {
        console.log("Successful Login. Token =", token);
    }
}); */
