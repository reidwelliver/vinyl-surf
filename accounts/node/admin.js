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

var Admin = function(opt, callback) {
    var thisAdmin = this;
    var connect = mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '',
      database : 'surf'
    });

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
        messages.invoke('TokenToUser',{xtoken:token}, function(data){
            console.log(data);
            callback(data.user.administrator);
        });;
    }

    this.StompEvents = function () {
        messages.connect( function() {
            console.log("connected!");

           messages.provide('GetAllUsers', function(message, options, respondMethod){
               thisAdmin.CheckAdmin(message.xtoken, function(admin) {

                   if (thisAdmin.isAdmin(admin)) {
                        thisAdmin.GetAllUsers(function (err, results) {
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
            });

            messages.provide("BanUsers", function(message, options, respondMethod){
                thisAdmin.CheckAdmin(message.xtoken, function(admin) {
                    thisAdmin.BanUsers(message.users, function(err, result){
                        messages.respond({users: results}, options);
                    });
                });
            });

            messages.provide('GetAllReports', function(message, options, respondMethod){
               thisAdmin.CheckAdmin(message.xtoken, function(admin) {
                    if (thisAdmin.isAdmin(admin)) {
                        var reports = [];
                        reports.push({id: 1, username: "test", room: "test-room", reason: "flames"});
                        reports.push({id: 2, username: "test1", room: "test-room", reason: "bad words"});
                        messages.respond({reports: reports, error: null}, options);
                    }
               });
            });
        });
    }

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
        thisAdmin.StompEvents();
    }
		opt.Test();
    thisAdmin.init();
}

exports.admin = Admin;
