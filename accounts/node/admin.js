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

var Admin = function(callback) {
    var thisAdmin = this;
		var thisAuth = null;

    var connect = mysql.createConnection({
      host     : 'db',
      user     : 'root',
      password : '',
      database : 'surf'
    });

    this.GetAllReports = function (callback) {
         connect.query("SELECT * FROM reports", function (err, rows, fields) {
            callback(rows);
        });
    }
    this.GetAllUsers = function (callback) {
        console.log("Get all users");
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

    this.init  = function() {
    }

    thisAdmin.init();
}

exports.admin = Admin;
