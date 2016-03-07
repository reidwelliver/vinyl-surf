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

function Admin(callback) {
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
        }
        else {
            console.log("Someones trying to hack us captain");
        }       
    }
    this.CheckAdmin = function (token, callback) {
        messages.invoke('TokenToUser',{xtoken:token}, function(data){  
            callback(data.user.administrator);
        });;
    }
    
    this.StompEvents = function () {
        messages.connect( function() {
            console.log("connected!");
            
           messages.provide('GetAllUsers', function(message, options, respondMethod){
               thisAdmin.CheckAdmin(message.xtoken, function(isAdmin) {
                   if (thisAdmin.isAdmin(admin)) {
                        thisAdmin.GetAllUsers(function (results) {
                            message.respond({users: results}, options); 
                        });
                   }
               });           
            });  
            
            message.provide("BanUsers", function(message, options, respondMethod){
                thisAdmin.CheckAdmin(message.xtoken, function(admin) {  
                    thisAdmin.BanUsers(message.users, function(err, result){
                        messages.respond({users: results}, options);     
                    });
                });
            });
            
            messages.provide('GetAllReports', function(message, options, respondMethod){
               thisAdmin.CheckAdmin(message.xtoken, function(admin) {
                    if (thisAdmin.isAdmin(admin)) {
                        thisAdmin.GetAllReports(function (results) {
                            messages.respond({reports: results}, options); 
                        });                        
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
        connect.query("SELECT id, username, administrator FROM users", function (err, rows, fields) {
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
    thisAdmin.init();
}


var admin = new Admin(null);


