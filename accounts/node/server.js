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
		var Admin = null;
    var connect = mysql.createConnection({
      host     : "db",
      user     : 'root',
      password : '',
      database : 'surf'
    });

    var userTokens = new Map();

		this.GetAllUsers = function (callback) {
        connect.query("SELECT id, username, administrator, create_date FROM users", function (err, rows, fields) {
            console.log(rows);
            callback(err, rows);
        });
    }
    this.BanUsers = function (users, ban_type, callback) {
        for (var i = 0; i < users.length; i++) {
            if (ban_type == 0) { //Sitewide ban
                 connect.query("UPDATE users SET ban_date = now() where id = ?", users[i].id, function (err, rows, fields) {
                    if (err) {
                        callback("error", null);
                    }
                    else { //success
                        callback(null, rows);
                    }
                });
            }
        }
    }

    this.ExtendToken = function(token, callback) {
        var expire_time = (Date.now() / 1000) + 900;
        connect.query("UPDATE tokens SET expire_time = ? where token = ?", [expire_time, token], function (err, rows, fields) {
            console.log(rows);
        });
    }

    this.TokenToUser = function(token, callback) {
			console.log(token);
      connect.query("SELECT user_id, administrator FROM tokens,users WHERE token = ? and tokens.user_id = users.id", [token],  function (err, rows, fields) {
          if (err || rows.length == 0) {
						 console.log(err);
             callback("Not found", null);
						 return;
          }

          var row = rows[0];
					callback(err, row);
       });
    }

		this.isAdmin = function(admin) {
        if (admin) {
            console.log("Admin successfully authenticated");
            return true;
        }
        else {
            console.log("Someones trying to hack us captain");
            return false;
        }
    }

    this.CheckAdmin = function (token, callback) {
				thisAuth.TokenToUser(token, function(err, data) {
					if (err) {
						console.log(err);
						callback(err, data);
					}
					else {
						console.log(data);
						callback(err, data.administrator);
					}
				});
    }

    this.VerifyToken = function (token, callback) {
        if (userTokens[token]) {
            var expire_time = userTokens[token].expire_time;
            var current_time = Date.now() / 1000;
            if (current_time >= expire_time) {
                callback("Token expired", null);
            }
            else {
                callback(null, token);
            }
        }
        else {
            connect.query("SELECT * FROM tokens WHERE token = ?", [token],  function (err, rows, fields) {
                if (err || rows.length == 0) {
                     callback("Not found", null);
                }
                else {
                    var row = rows[0];
                    var current_time = Date.now() / 1000;
                    if (current_time >= row.expire_time) {
                        callback("Token expired", null);
                    }
                    else {
                        userTokens[token] = row;
                        callback(null, token);
                    }
                }
            });
        }
    }

    this.StompEvents = function () {
        messages.connect( function() {
          console.log("connected!");

					messages.provide('GetAllUsers', function(message, options, respondMethod){
							console.log("GetAllUsers ", message);
							if (message === undefined) {
								messages.respond({users: null, error: "Not Authorized"}, options);
								console.log("Bad message");
							}
							else {
								thisAuth.CheckAdmin(message.xtoken, function(err, admin) {
									if (err) {
										messages.respond({users: null, error: "Not Authorized"}, options);
									}
									else if (thisAuth.isAdmin(admin)) {
										console.log(Admin);
										thisAuth.GetAllUsers(function (err, results) {
												 if (err) {
														 console.log(err);
														 messages.respond({users: null, error: err}, options);
												 }
												 else {
														 console.log("Response:", results);
														 messages.respond({users: results, error: null}, options);
												 }
										 	});
										}
										else {
											messages.respond({users: null, error: "Not Authorized"}, options);
										}
								});
							}
					 });

					 messages.provide("BanUsers", function(message, options, respondMethod){
							 thisAuth.CheckAdmin(message.xtoken, function(admin) {
									 thisAuth.BanUsers(message.users, function(err, result){
											 messages.respond({users: results}, options);
									 });
							 });
					 });

					 messages.provide('GetAllReports', function(message, options, respondMethod){
						 if (message === undefined) {
							 messages.respond({users: null, error: "Not Authorized"}, options);
							 console.log("Bad message");
						 }
						 else {
							 thisAuth.CheckAdmin(message.xtoken, function(err, admin) {
									if (err) {
										messages.respond({users: null, error: "Not Authorized"}, options);
									}
									else if (thisAuth.isAdmin(admin)) {
										 var reports = [];
										 reports.push({id: 1, username: "test", room: "test-room", reason: "flames"});
										 reports.push({id: 2, username: "test1", room: "test-room", reason: "bad words"});
										 messages.respond({reports: reports, error: null}, options);
									}
									else {
										messages.respond({users: null, error: "Not Authorized"}, options);
									}
								});
						 }
					 });

           messages.provide('isAuthenticated', function(message, options, respondMethod){
               console.log("Checking authetication for", message);
               if (message.xtoken != "") {
                    thisAuth.VerifyToken(message.xtoken, function (err, result) {
                        if (err) {
                            messages.respond({xtoken: "", error: err}, options);
                            console.log("error", err);
                        } else {
                            messages.respond({xtoken: result, error: null}, options);
                        }
                    });
               }
               else {
                   messages.respond({xtoken: "", error: "err"}, options);
               }
            });

            messages.provide('Login', function(message, options, respondMethod){
                console.log("Checking login for", message);

                var username = message.username;
                var password = message.password;

                if (username == undefined || password == undefined ||  username.length < 4 || password.length < 4)
                    return;
                //change to return user object
                thisAuth.Login(username, password, function(err, result) {
                    if (err) {
                        console.log(err);
                        messages.respond({xtoken: "", user: null, error: err}, options);
                    }
                    else {
                        console.log("Successful Login. Token =", result.xtoken);
												console.log("Row: ", result);
                        messages.respond({xtoken: result.xtoken, user: result.user, error: null}, options);
                    /*    thisAuth.VerifyToken(token, function(err, result) {

                        });*/
                    }
                });
            });

            messages.provide('TokenToUser', function(message, options, respondMethod) {
                thisAuth.TokenToUser(message.xtoken, function (err, result) {
                    messages.respond({user: result, error:null}, options);
                });
            });

            messages.provide('Register', function(message, options, respondMethod){
                console.log("Checking register for", message);
                var username = message.username;
                var password = message.password;
                var email = message.email;

                if (username == undefined || password == undefined ||  username.length < 4 || password.length < 4)
                    return;
                //change to return user object
                thisAuth.Register(username, password, email, function(err, result) {
                    if (err) {
                        console.log(err);
                        messages.respond({xtoken: "", user: null, error: err}, options);
                    }
                    else {
                        console.log("Successful Login to new registered user. Result =", result);
                        messages.respond({xtoken: result.xtoken, user: result.user, error: null}, options);
                    }
                });
            });
        });
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

    this.SetToken = function(id, callback) {
        var token = crypto.randomBytes(64).toString('hex');
        var TokenUser = new thisAuth.TokenUser(id, token);

        connect.query('INSERT INTO tokens SET ?', TokenUser, function (err, result) {
            if (err) {
                callback(err, null);
            }
            else {
                userTokens[token] = TokenUser;
                callback(null, token);
            }
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
                thisAuth.SetToken(user_row['id'], function (err, token) {
                    callback(err, {user: user_row, xtoken: token});
                });
            }
            else {
                callback("Login Failed", "");
            }
        });
    }
    this.DoLogin = function(username, password, callback) {
        connect.query("SELECT id, username, email_address, administrator, upvotes, downvotes FROM users WHERE username = ? and password = ?", [username, password],  function (err, rows, fields) {
            if (err) {
                callback(err, null);
            }
            else if (rows.length > 0) {
                callback(null, rows[0]);
            }
            else {
                callback(err, null);
            }
        });
    }
    this.checkUsername = function(username, callback) {
        connect.query("SELECT id, username, email_address, administrator, upvotes, downvotes FROM users WHERE username = ?", username, function (err, rows, fields) {
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
                callback(err, null);
            }
            callback(null, results);
        });
    }
    this.Register = function(username, password, email, callback) {
        var thisRegister = this;
        this.checkUsername(username, function(err, success) {
            if (err) {

								console.log("check username error: ", err);
                //console.log(new Error().stack);
            }
            if (success) {
                var newUser = new thisAuth.User(username, password, email);
                thisAuth.SQLRegister(newUser, function(err, results) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    }
                    else {
                        thisAuth.SetToken(results.insertId, function (err, token) {
                            if (err)
                                callback(err, null);
                            else {
                                thisAuth.TokenToUser(token, function (err, result) {
                                    callback(null, {user: result, xtoken: token});
                                });
                            }
                        });
                    }
                });
            }
            else {
                callback("User already registered", null);
            }
        });
    }

		this.init = function() {
				console.log("Init");
        thisAuth.StompEvents();
    }

    thisAuth.init();
}

var auth = new Auth(null);
auth.Register("admin", "admin", "admin@admin.com", function(err, result) {
    if (err)
        console.log(err);
    console.log(result);
});
//var admin = new Admin.Admin(auth);

//console.log("test");
/*auth.Login("test1", "test", function(err, token) {
    if (err)
        console.log(err);
    else {
        console.log("Successful Login. Token =", token);
    }
}); */
