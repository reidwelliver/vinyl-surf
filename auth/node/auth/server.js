var mysql = require('mysql');
var crypto = require('crypto');
var fs = require('fs');
var stomp = require('./stomp-client.js');

messages = new stomp({
	endpoint: 'ws://vinyl.surf:15674/stomp/websocket',
	user: 'vinyl-surf',
	pass: 'vinyl-surf',
	mode: 'server'
});

function Auth(callback) {
    var thisAuth = this;
    var connect = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '',
      database : 'surf'
    });

    var userTokens = new Map();

    this.VerifyToken = function (token, callback) {
        if (userTokens[token]) {
            var expire_time = userTokens[token].expire_time;
            var current_time = Date.now() / 1000;
            if (current_time >= expire_time) {
                callback(null, token);
                return;
            }
        }

        connect.query("SELECT * FROM tokens WHERE token = ?", [token],  function (err, rows, fields) {
            var row = rows[0];
            var current_time = Date.now() / 1000;
            if (current_time >= row.expire_time) {
                callback("Token expired", null);
            }
            else {
                userTokens[token] = row;
                console.log(null, token);
            }
        });
        callback("Not found", null);
    }

    this.StompEvents = function () {
        messages.connect( function() {
            console.log("connected!");

           messages.provide('isAuthenticated', function(message, options, respondMethod){
               console.log("Checking authetication for", message);
               if (message.xtoken != "") {
                    VerifyToken(message.xtoken, function (err, result) {
                        if (err) {
                            message.respond({xtoken: "", error: err}, options);
                            console.log(err);
                        } else {
                            message.respond({xtoken: result, error: null}, options);
                        }
                    });
               }
            });
            messages.provide('Login', function(message, options, respondMethod){

            });
        });
    }

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
                //change to return user object
                thisAuth.Login(username, password, function(err, token) {
                    if (err)
                        console.log(err);
                    else {
                        console.log("Successful Login. Token =", token);
                        socket.emit("Token", {token: token, });
                    /*    thisAuth.VerifyToken(token, function(err, result) {

                        });*/
                    }
                });
            });

            socket.on('Message', function(data){
                console.log("test", data);
            });
            socket.on('Verify', function(data) {
                var token = data.token;
                VerifyToken(token, function(err, result) {

                });
            })
        });

    }
    this.init = function() {
    //    thisAuth.socket = io.of('/auth');
    //    thisAuth.SocketEvents();
        thisAuth.StompEvents();
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
            callback(err, result);
        });
    }

    this.Login = function(username, password, callback) {
        var thisLogin = this;
        this.DoLogin(username, password, function(err, user_row) {
            if (err) {
                console.log(new Error().stack);
                callback(err, "");
            }
            else if (user_row) {
                var token = crypto.randomBytes(64).toString('hex');
                thisLogin.SetToken(new thisLogin.TokenUser(user_row['id'], token), function (err, result) {
                    //console.log("error:", err);
                    if (err)
                        callback(err, null);
                    else
                        callback(err, token);
                });
            }
            else {
                callback("Login Failed", "");
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


/*auth.Login("test1", "test", function(err, token) {
    if (err)
        console.log(err);
    else {
        console.log("Successful Login. Token =", token);
    }
}); */
